document.addEventListener('DOMContentLoaded', () => {
    const galleries = document.querySelectorAll('.gallery');
    galleries.forEach(gallery => {
        new MauGallery(gallery, {
            columns: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 3
            },
            lightBox: true,
            lightboxId: 'myAwesomeLightbox',
            showTags: true,
            tagsPosition: 'top'
        });
    });
});
