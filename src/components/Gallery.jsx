import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { Helmet } from 'react-helmet';
import { db } from '../firebase';
import html2canvas from 'html2canvas';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

function Gallery() {
  const [gallery, setGallery] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [index, setIndex] = useState(-1);
  const { id } = useParams();

  useEffect(() => {
    const fetchGallery = async () => {
      const docRef = doc(db, "galleries", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const galleryData = docSnap.data();
        setGallery(galleryData);
        
        if (galleryData.images.length > 0) {
          const canvas = document.createElement('canvas');
          canvas.width = 1200;
          canvas.height = 630;
          const ctx = canvas.getContext('2d');
          
          const imagesToLoad = galleryData.images.slice(0, 4);
          const loadedImages = await Promise.all(
            imagesToLoad.map(url => {
              return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.src = url;
              });
            })
          );
          
          loadedImages.forEach((img, index) => {
            const x = (index % 2) * 600;
            const y = Math.floor(index / 2) * 315;
            ctx.drawImage(img, x, y, 600, 315);
          });
          
          setPreviewImage(canvas.toDataURL());
        }
      }
    };
    
    fetchGallery();
  }, [id]);

  if (!gallery) {
    return <div>Loading...</div>;
  }

  const downloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Verifica se il dispositivo è mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Su mobile, creiamo un elemento a con attributo download
        const link = document.createElement('a');
        link.href = imageUrl;
        // Forza il download invece di aprire in una nuova tab
        link.setAttribute('download', '');
        link.setAttribute('target', '_blank');
        link.click();
      } else {
        // Su desktop, usiamo il metodo esistente
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = imageUrl.split('/').pop() || 'campsnap-image.jpg';
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>{gallery?.title ? `${gallery.title} — Camp Snaps` : 'Camp Snaps — Share your Memories'}</title>
        
        {/* Meta tag per Open Graph (Facebook, etc) */}
        <meta property="og:title" content={gallery?.title ? `${gallery.title} — Camp Snaps` : 'Camp Snaps — Share your Memories'} />
        <meta property="og:description" content="Check out these amazing memories!" />
        <meta property="og:type" content="website" />
        {previewImage && <meta property="og:image" content={previewImage} />}
        
        {/* Meta tag per Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={gallery?.title ? `${gallery.title} — Camp Snaps` : 'Camp Snaps — Share your Memories'} />
        <meta name="twitter:description" content="Check out these amazing memories!" />
        {previewImage && <meta name="twitter:image" content={previewImage} />}
      </Helmet>
      
      <div className="gallery-container">
        <h1 className="gallery-title">{gallery.title}</h1>
        <div className="image-grid">
          {gallery.images.map((url, i) => (
            <div key={i} className="image-container">
              <img
                src={url}
                alt={`Image ${i + 1}`}
                onClick={() => setIndex(i)}
                className="gallery-image"
              />
              <button 
                className="download-button"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(url);
                }}
              >
                Download
              </button>
            </div>
          ))}
        </div>
        
        <div className="gallery-footer">
          <p>Pics taken with <a href="https://www.campsnapphoto.com/" target="_blank" rel="noopener noreferrer">Camp Snap Camera</a></p>
        </div>
        
        <Lightbox
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          slides={gallery.images.map(url => ({ src: url }))}
        />
      </div>
    </>
  );
}

export default Gallery;