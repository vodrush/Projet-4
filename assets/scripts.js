$(document).ready(function() {
    if ($('.gallery').length > 0) {
        $('.gallery').mauGallery({
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
        console.log("Gallery initialized successfully");
    } else {
        console.error("Gallery element not found");
    }
});
