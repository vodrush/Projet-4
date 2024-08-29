(function($) {
    $.fn.mauGallery = function(options) {
        var options = $.extend($.fn.mauGallery.defaults, options);
        var tagsCollection = [];
        return this.each(function() {
            $.fn.mauGallery.methods.createRowWrapper($(this));
            if (options.lightBox) {
                $.fn.mauGallery.methods.createLightBox($(this), options.lightboxId, options.navigation);
            }
            $.fn.mauGallery.listeners(options);

            $(this).children(".gallery-item").each(function(index) {
                $(this).attr('data-index', index);  // Assign a unique index to each image
                $.fn.mauGallery.methods.responsiveImageItem($(this));
                $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
                $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
                var theTag = $(this).data("gallery-tag");
                if (options.showTags && theTag !== undefined && tagsCollection.indexOf(theTag) === -1) {
                    tagsCollection.push(theTag);
                }
            });

            if (options.showTags) {
                $.fn.mauGallery.methods.showItemTags($(this), options.tagsPosition, tagsCollection);
            }

            $(this).fadeIn(500);
        });
    };

    $.fn.mauGallery.defaults = {
        columns: 3,
        lightBox: true,
        lightboxId: null,
        showTags: true,
        tagsPosition: "bottom",
        navigation: true
    };

    $.fn.mauGallery.listeners = function(options) {
        $(".gallery-item").on("click", function() {
            if (options.lightBox && $(this).prop("tagName") === "IMG") {
                $.fn.mauGallery.methods.loadBootstrapAndOpenLightBox($(this), options.lightboxId);
            }
        });

        $(".gallery").on("click", ".nav-link", function() {
            $.fn.mauGallery.methods.filterByTag.call(this);
        });

        $(".gallery").on("click", ".mg-prev", function() {
            $.fn.mauGallery.methods.prevImage(options.lightboxId);
        });

        $(".gallery").on("click", ".mg-next", function() {
            $.fn.mauGallery.methods.nextImage(options.lightboxId);
        });
    };

    $.fn.mauGallery.methods = {
        createRowWrapper(element) {
            if (!element.children().first().hasClass("row")) {
                element.append('<div class="gallery-items-row row"></div>');
            }
        },

        wrapItemInColumn(element, columns) {
            if (columns.constructor === Number) {
                element.wrap(`<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`);
            } else if (columns.constructor === Object) {
                var columnClasses = "";
                if (columns.xs) {
                    columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
                }
                if (columns.sm) {
                    columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
                }
                if (columns.md) {
                    columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
                }
                if (columns.lg) {
                    columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
                }
                if (columns.xl) {
                    columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
                }
                element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
            } else {
                console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
            }
        },

        moveItemInRowWrapper(element) {
            element.appendTo(".gallery-items-row");
        },

        responsiveImageItem(element) {
        },

        loadBootstrapAndOpenLightBox(element, lightboxId) {
            $.fn.mauGallery.methods.loadBootstrap(function() {
                $.fn.mauGallery.methods.openLightBox(element, lightboxId);
            });
        },

        loadBootstrap(callback) {
            if (!document.getElementById("bootstrap-css")) {
                const bootstrapCSS = document.createElement("link");
                bootstrapCSS.id = "bootstrap-css";
                bootstrapCSS.rel = "stylesheet";
                bootstrapCSS.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
                document.head.appendChild(bootstrapCSS);
            }

            if (!document.getElementById("bootstrap-js")) {
                const bootstrapJS = document.createElement("script");
                bootstrapJS.id = "bootstrap-js";
                bootstrapJS.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js";
                bootstrapJS.onload = callback;
                document.body.appendChild(bootstrapJS);
            } else {
                callback();
            }
        },

        openLightBox(element, lightboxId) {
            const lightboxElement = $(`#${lightboxId}`);
            const lightboxImage = lightboxElement.find(".lightboxImage");
            lightboxImage.attr("src", element.attr("src")).addClass("img-fluid");
            lightboxElement.data('current-index', element.data('index'));

            lightboxElement.on('shown.bs.modal', function () {
                lightboxImage.addClass("img-fluid");
            });

            lightboxElement.on('hidden.bs.modal', function () {
                lightboxImage.removeClass("img-fluid");
            });

            lightboxElement.modal("show");
        },

        prevImage(lightboxId) {
            const lightboxElement = $(`#${lightboxId}`);
            let currentIndex = lightboxElement.data('current-index');
            let imagesCollection = [];
            let activeTag = $(".tags-bar .nav-link.active").data("images-toggle");

            $(".gallery-item").each(function() {
                if (activeTag === "all" || $(this).data("gallery-tag") === activeTag) {
                    imagesCollection.push($(this));
                }
            });

            let prevIndex = (currentIndex - 1 + imagesCollection.length) % imagesCollection.length;
            let prev = imagesCollection[prevIndex];

            lightboxElement.data('current-index', prev.data('index'));
            $(".lightboxImage").attr("src", prev.attr("src"));
        },

        nextImage(lightboxId) {
            const lightboxElement = $(`#${lightboxId}`);
            let currentIndex = lightboxElement.data('current-index');
            let imagesCollection = [];
            let activeTag = $(".tags-bar .nav-link.active").data("images-toggle");

            $(".gallery-item").each(function() {
                if (activeTag === "all" || $(this).data("gallery-tag") === activeTag) {
                    imagesCollection.push($(this));
                }
            });

            let nextIndex = (currentIndex + 1) % imagesCollection.length;
            let next = imagesCollection[nextIndex];

            lightboxElement.data('current-index', next.data('index'));
            $(".lightboxImage").attr("src", next.attr("src"));
        },

        createLightBox(gallery, lightboxId, navigation) {
            gallery.append(`<div class="modal fade" id="${
                lightboxId ? lightboxId : "galleryLightbox"
            }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                                navigation
                                    ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                    : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage" alt="Contenu de l\'image affichée dans la modale au clique"/>
                            ${
                                navigation
                                    ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>'
                                    : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
        },

        showItemTags(gallery, position, tags) {
            var tagItems =
                '<li class="nav-item"><span class="nav-link active"  data-images-toggle="all">Tous</span></li>';
            $.each(tags, function(index, value) {
                tagItems += `<li class="nav-item">
                    <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
            });
            var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}<div class="active-tag-bg"></div></ul>`;

            if (position === "bottom") {
                gallery.append(tagsRow);
            } else if (position === "top") {
                gallery.prepend(tagsRow);
            } else {
                console.error(`Unknown tags position: ${position}`);
            }

            const $activeLink = $('.tags-bar .nav-link.active');
            const $bg = $('.tags-bar .active-tag-bg');
            $bg.width($activeLink.outerWidth());
            $bg.css('left', $activeLink.position().left);
        },

        filterByTag() {
            const $this = $(this);
            if ($this.hasClass("active")) {
                return;
            }

            $(".tags-bar .nav-link.active").removeClass("active");
            $this.addClass("active");

            const $bg = $('.tags-bar .active-tag-bg');
            $bg.width($this.outerWidth());
            $bg.css('left', $this.position().left);

            var tag = $this.data("images-toggle");

            $(".gallery-item").each(function() {
                $(this).parents(".item-column").hide();
                if (tag === "all") {
                    $(this).parents(".item-column").show(300);
                } else if ($(this).data("gallery-tag") === tag) {
                    $(this).parents(".item-column").show(300);
                }
            });
        }
    };
})(jQuery);
