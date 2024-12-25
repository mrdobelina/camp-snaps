import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { Helmet } from 'react-helmet'
import './App.css'
import logo from './assets/CampSnap_Logo.png'
import DropZone from './components/DropZone'
import { storage, db, auth } from './firebase'
import { compressImage } from './utils/imageCompression'

function App() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [galleryTitle, setGalleryTitle] = useState('')
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const count = localStorage.getItem('totalPhotosUploaded') || 0
    setTotalPhotos(Number(count))
  }, [])

  useEffect(() => {
    document.title = 'Camp Snaps - Share Your Memories'
  }, [])

  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles)
    console.log('Files caricati:', acceptedFiles)
  }, [])

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Come on, select at least one image—you got this!')
      return
    }

    try {
      console.log('Attempting anonymous sign in...');
      const userCredential = await signInAnonymously(auth);
      console.log('Authentication successful:', userCredential.user);
      console.log('User ID:', userCredential.user.uid);
      
      setUploading(true)
      setUploadProgress(0)

      console.log('Squishing images to make them fit—hold tight!')
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      )
      setUploadProgress(20)

      console.log('Uploading your memories... almost there!')
      const uploadPromises = compressedFiles.map(async (file, index) => {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const storageRef = ref(storage, `images/${fileName}`)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        setUploadProgress(20 + Math.floor((index + 1) / files.length * 60))
        return url
      })

      const urls = await Promise.all(uploadPromises)
      setUploadProgress(80)

      const docRef = await addDoc(collection(db, "galleries"), {
        title: galleryTitle,
        images: urls,
        createdAt: new Date().toISOString()
      })

      setUploadProgress(90)

      const newTotal = totalPhotos + files.length
      localStorage.setItem('totalPhotosUploaded', newTotal)
      setTotalPhotos(newTotal)
      
      setUploadProgress(100)
      navigate(`/gallery/${docRef.id}`)
      
    } catch (error) {
      console.error('Oops, something went wrong while uploading! Try again?', error)
      alert('Whoops! An error occurred during the upload. Wanna give it another shot?')
    }
    setUploading(false)
    setUploadProgress(0)
  }

  return (
    <>
      <Helmet>
        <title>Camp Snaps - Share Your Memories</title>
        <meta property="og:title" content="Camp Snaps - Share Your Memories" />
        <meta property="og:description" content="Share your Camp Snap memories with friends and family" />
      </Helmet>
      <div className="app-container">
        <div className="main-content">
          <img src={logo} alt="Logo" className="logo" />
          <div className="intro-text">
            <p className="main-intro">A simple tool to share your Camp Snap memories with friends and family</p>
            <p className="sub-intro">This website is not directly affiliated with Camp Snap, I'm just a fan!</p>
          </div>
          <input 
            type="text"
            placeholder="Name your gallery"
            value={galleryTitle}
            onChange={(e) => setGalleryTitle(e.target.value)}
            className="gallery-title-input"
          />
          <DropZone onDrop={onDrop} files={files} />
          <button 
            className="create-link-button" 
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? `Uploading your memories (${files.length} foto)` : 'LINK MY SNAPS'}
          </button>
          {uploading && (
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${uploadProgress}%` }}
              />
              <div className="progress-text">{uploadProgress}%</div>
            </div>
          )}
        </div>
        <footer className="footer">
          <p className="stats">Uploaded memories: {totalPhotos}</p>
          <a 
            href="mailto:hello@filippomursia.com" 
            className="contact-link"
          >
            Contact me for feedback, or just to say hi!
          </a>
        </footer>
      </div>
    </>
  )
}

export default App