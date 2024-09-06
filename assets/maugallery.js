class MauGallery {
    constructor(element, options = {}) {
        this.element = element;
        this.options = Object.assign({}, MauGallery.defaults, options);
        this.init();
    }

    static defaults = {
        columns: 3,
        lightBox: true,
        lightboxId: null,
        showTags: true,
        tagsPosition: "bottom",
        navigation: true
    };

    init() {
        this.createRowWrapper();
        if (this.options.lightBox) {
            this.createLightBox();
        }
        this.handleImages();
        if (this.options.showTags) {
            this.showItemTags();
        }
        this.element.style.display = 'block';
        this.setupListeners();
    }

    createRowWrapper() {
        if (!this.element.querySelector('.gallery-items-row')) {
            const row = document.createElement('div');
            row.className = 'gallery-items-row row';
            this.element.appendChild(row);
        }
    }

    handleImages() {
        const images = this.element.querySelectorAll('img');
        this.tagsCollection = new Set();

        images.forEach((img, index) => {
            img.classList.add('gallery-item');
            img.setAttribute('data-index', index);
            this.responsiveImageItem(img);
            this.moveItemInRowWrapper(img);
            this.wrapItemInColumn(img, this.options.columns);
            
            const tag = img.getAttribute('data-gallery-tag');
            if (this.options.showTags && tag) {
                this.tagsCollection.add(tag);
            }
        });

        this.tagsCollection = Array.from(this.tagsCollection);
    }

    responsiveImageItem(image) {
        image.classList.add('img-fluid');
    }

    moveItemInRowWrapper(element) {
        const row = this.element.querySelector('.gallery-items-row');
        row.appendChild(element);
    }

    wrapItemInColumn(element, columns) {
        const column = document.createElement('div');
        if (typeof columns === 'number') {
            column.className = `item-column mb-4 col-${Math.ceil(12 / columns)}`;
        } else if (typeof columns === 'object') {
            let columnClasses = 'item-column mb-4';
            for (let breakpoint in columns) {
                columnClasses += ` col-${breakpoint}-${Math.ceil(12 / columns[breakpoint])}`;
            }
            column.className = columnClasses;
        }
        element.parentNode.insertBefore(column, element);
        column.appendChild(element);
    }

    createLightBox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'modal fade';
        lightbox.id = this.options.lightboxId || 'galleryLightbox';
        lightbox.tabIndex = '-1';
        lightbox.role = 'dialog';
        lightbox.ariaHidden = 'true';
        
        lightbox.innerHTML = `
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-body">
                        ${this.options.navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;">&lt;</div>' : ''}
                        <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                        ${this.options.navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">&gt;</div>' : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(lightbox);
    }

    showItemTags() {
        const tagsRow = document.createElement('ul');
        tagsRow.className = 'my-4 tags-bar nav nav-pills';

        let tagItems = '<li class="nav-item"><span class="nav-link active" data-images-toggle="all">Tous</span></li>';
        this.tagsCollection.forEach(tag => {
            tagItems += `<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`;
        });

        tagsRow.innerHTML = tagItems;

        if (this.options.tagsPosition === "top") {
            this.element.prepend(tagsRow);
        } else {
            this.element.appendChild(tagsRow);
        }
    }

    setupListeners() {
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('gallery-item') && this.options.lightBox) {
                this.openLightBox(e.target);
            } else if (e.target.classList.contains('nav-link')) {
                this.filterByTag(e.target);
            }
        });

        const lightbox = document.getElementById(this.options.lightboxId || 'galleryLightbox');
        if (lightbox) {
            lightbox.querySelector('.mg-prev').addEventListener('click', () => this.prevImage());
            lightbox.querySelector('.mg-next').addEventListener('click', () => this.nextImage());
        }
    }

    openLightBox(element) {
        const lightbox = document.getElementById(this.options.lightboxId || 'galleryLightbox');
        const lightboxImage = lightbox.querySelector('.lightboxImage');
        lightboxImage.src = element.src;
        lightbox.dataset.currentIndex = element.dataset.index;
        
        const modal = new bootstrap.Modal(lightbox);
        modal.show();
    }

    prevImage() {
        this.navigateImage('prev');
    }

    nextImage() {
        this.navigateImage('next');
    }

    navigateImage(direction) {
        const lightbox = document.getElementById(this.options.lightboxId || 'galleryLightbox');
        let currentIndex = parseInt(lightbox.dataset.currentIndex);
        
        const activeTag = this.element.querySelector('.tags-bar .nav-link.active').dataset.imagesToggle;
        const visibleImages = Array.from(this.element.querySelectorAll('.gallery-item')).filter(img => 
            activeTag === 'all' || img.dataset.galleryTag === activeTag
        );

        if (visibleImages.length === 0) return;

        let newIndex = direction === 'prev' ? 
            (currentIndex - 1 + visibleImages.length) % visibleImages.length : 
            (currentIndex + 1) % visibleImages.length;

        const newImage = visibleImages[newIndex];
        lightbox.querySelector('.lightboxImage').src = newImage.src;
        lightbox.dataset.currentIndex = newImage.dataset.index;
    }

    filterByTag(tagElement) {
        if (tagElement.classList.contains('active')) return;

        this.element.querySelectorAll('.tags-bar .nav-link').forEach(el => el.classList.remove('active'));
        tagElement.classList.add('active');

        const tag = tagElement.dataset.imagesToggle;
        let visibleIndex = 0; 

        this.element.querySelectorAll('.gallery-item').forEach(item => {
            const column = item.closest('.item-column');
            if (tag === 'all' || item.dataset.galleryTag === tag) {
                column.style.display = '';
                item.setAttribute('data-index', visibleIndex);  
                visibleIndex++;
            } else {
                column.style.display = 'none';
            }
        });
    }
}
