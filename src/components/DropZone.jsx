import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

function DropZone({ onDrop, files }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    }
  })

  return (
    <div>
      {files.length > 0 ? (
        <div className="preview-container">
          {files.map((file, index) => (
            <div key={index} className="preview-image-container">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="preview-image"
              />
            </div>
          ))}
        </div>
      ) : (
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drag your images here</p>
          ) : (
            <p>Drag here your images, or click to chose them</p>
          )}
        </div>
      )}
    </div>
  )
}

export default DropZone