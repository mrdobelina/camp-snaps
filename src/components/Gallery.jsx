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

  return (
    <>
    
<Helmet>
  <title>
    {gallery?.title 
      ? `${gallery.title} — Made with Camp Snap`
      : 'Camp Snaps — Share your Memories'}
  </title>
  <meta 
    property="og:title" 
    content={gallery?.title 
      ? `${gallery.title} — Made with Camp Snap`
      : 'Camp Snaps — Share your Memories'} 
  />
  <meta property="og:description" content="Check out these amazing memories!" />
  {previewImage && <meta property="og:image" content={previewImage} />}
</Helmet>
      <div className="gallery-container">
        <h1 className="gallery-title">{gallery.title}</h1>
        <div className="image-grid">
          {gallery.images.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Image ${i + 1}`}
              onClick={() => setIndex(i)}
              className="gallery-image"
            />
          ))}
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