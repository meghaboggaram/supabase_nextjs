import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import Image from 'next/image'

export default function Avatar({ url, size, onUpload }) {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

   function downloadImage(path) {
    try {
      const { data, error } = supabase.storage.from('avatars').getPublicUrl(path)
      if (error) {
        throw error
      }
      console.log('getPublicUrl', data)
      const url = data.publicURL
    //  const url = URL.createObjectURL(data) // use when using download API
      setAvatarUrl(url) //data.publicURL
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    }
  }


  async function uploadAvatar(event) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      if (url) {
        console.log(url)
        let { error: removeError } = await supabase.storage
          .from('avatars')
          .remove([url])
        
          if (removeError) {
            throw removeError
          }
      }
        let { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {avatarUrl? (
       /*  <img
          src={avatarUrl}
          alt="Avatar"
          className="avatar image"
          style={{ height: size, width:size}}
        /> */

        <Image
          src={avatarUrl}
          alt="Avatar"
          className="avatar image"
          height={size}
          width={size}
        /> 
      ) : (
        <div className="avatar no-image" style={{ height: size, width: size }} />
      )}
      <div style={{ width: size }}>
        <label className="button primary block" htmlFor="single">
          {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  )
}