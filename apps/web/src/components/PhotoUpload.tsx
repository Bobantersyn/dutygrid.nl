import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Image as ImageIcon, X, Upload } from 'lucide-react';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

export function PhotoUpload({ onPhotoCropped, initialPhotoUrl, label = "Profielfoto" }) {
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [showModal, setShowModal] = useState(false);
    const imgRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(initialPhotoUrl);

    function onSelectFile(e) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Makes crop preview update between images.
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '');
                setShowModal(true);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    }

    async function handleComplete() {
        if (completedCrop?.width && completedCrop?.height && imgRef.current) {
            const croppedImage = await getCroppedImg(imgRef.current, completedCrop, 'profile_cropped.jpeg');
            setPreviewUrl(croppedImage.url);
            onPhotoCropped(croppedImage.file);
            setShowModal(false);
        }
    }

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
                <div className="flex items-center gap-2">
                    <ImageIcon size={16} />
                    {label}
                </div>
            </label>
            <div className="flex items-center gap-4">
                {previewUrl ? (
                    <div className="relative">
                        <img src={previewUrl} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" alt="Preview" />
                        <button type="button" onClick={() => { setPreviewUrl(null); onPhotoCropped(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 shadow-sm transition-opacity">
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                        <Upload size={24} />
                    </div>
                )}
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onSelectFile}
                        className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-2">Kies een vierkante profielfoto (1:1)</p>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-lg text-gray-900">Profielfoto Bijsnijden</h3>
                            <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-auto flex-1 flex flex-col items-center justify-center bg-gray-100/50 min-h-[300px]">
                            {imgSrc && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    circularCrop
                                    className="max-h-[50vh] shadow-sm rounded-lg overflow-hidden border border-gray-200"
                                >
                                    <img
                                        ref={imgRef}
                                        alt="Crop me"
                                        src={imgSrc}
                                        onLoad={onImageLoad}
                                        className="max-h-[50vh] object-contain"
                                    />
                                </ReactCrop>
                            )}
                            <p className="text-sm text-gray-500 mt-4 text-center">Sleep de hoeken om de uitsnede te verplaatsen en te vergroten.</p>
                        </div>
                        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-xl transition-colors">
                                Annuleren
                            </button>
                            <button type="button" onClick={handleComplete} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm transition-colors">
                                Opslaan & Gebruiken
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function to extract the cropped image
function getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    // Draw the cropped image onto the canvas
    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );

    // Convert canvas to a File object
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            blob.name = fileName;
            const fileUrl = window.URL.createObjectURL(blob);
            const file = new File([blob], fileName, { type: 'image/jpeg', lastModified: Date.now() });
            resolve({ file, url: fileUrl });
        }, 'image/jpeg', 0.9); // Added quality parameter for better results
    });
}
