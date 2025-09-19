(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this).children(".gallery-item").each(function() {
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
    $(".gallery").on("click", ".gallery-item", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );

    // Fermeture lightbox
    $(document).on("click", "[data-mg-close]", function() {
      $.fn.mauGallery.methods.hideLightBox(options.lightboxId);
    });
    $(document).on("click", function(e) {
      const id = options.lightboxId ? options.lightboxId : "galleryLightbox";
      const $modal = $("#"+id);
      if ($modal.length && $modal.hasClass("show")) {
        // clic hors contenu => fermer
        if ($(e.target).is($modal)) {
          $.fn.mauGallery.methods.hideLightBox(id);
        }
      }
    });
    $(document).on("keydown", function(e) {
      const id = options.lightboxId ? options.lightboxId : "galleryLightbox";
      if (e.key === "Escape") $.fn.mauGallery.methods.hideLightBox(id);
      if (e.key === "ArrowLeft") $.fn.mauGallery.methods.prevImage(id);
      if (e.key === "ArrowRight") $.fn.mauGallery.methods.nextImage(id);
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
        var c = "";
        if (columns.xs) c += ` col-${Math.ceil(12 / columns.xs)}`;
        if (columns.sm) c += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        if (columns.md) c += ` col-md-${Math.ceil(12 / columns.md)}`;
        if (columns.lg) c += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        if (columns.xl) c += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        element.wrap(`<div class='item-column mb-4${c}'></div>`);
      } else {
        console.error(`Columns should be numbers or objects. ${typeof columns} is not supported.`);
      }
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") element.addClass("img-fluid");
    },

    // --- Lightbox helpers (sans Bootstrap JS) ---
    showLightBox(lightboxId) {
      const id = lightboxId ? lightboxId : "galleryLightbox";
      const $m = $("#"+id);
      if (!$m.length) return;
      // backdrop
      if (!$(".modal-backdrop.mg").length) {
        $("body").append('<div class="modal-backdrop fade mg"></div>');
        setTimeout(()=>{$(".modal-backdrop.mg").addClass("show");},10);
      }
      // modal
      $m.css("display","block").attr("aria-hidden","false").addClass("show");
      $("body").addClass("modal-open");
    },
    hideLightBox(lightboxId) {
      const id = lightboxId ? lightboxId : "galleryLightbox";
      const $m = $("#"+id);
      if (!$m.length) return;
      $m.removeClass("show").attr("aria-hidden","true");
      setTimeout(()=>{$m.css("display","none");},150);
      $(".modal-backdrop.mg").removeClass("show");
      setTimeout(()=>{$(".modal-backdrop.mg").remove();},150);
      $("body").removeClass("modal-open");
    },

    openLightBox(element, lightboxId) {
      const id = lightboxId ? lightboxId : "galleryLightbox";
      $("#"+id).find(".lightboxImage").attr("src", element.attr("src"));
      $.fn.mauGallery.methods.showLightBox(id);
    },

    prevImage() {
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) activeImage = $(this);
      });

      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) imagesCollection.push($(this).children("img"));
        });
      } else {
        $(".item-column").each(function() {
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0;
      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) index = i;
      });
      index = (index - 1 + imagesCollection.length) % imagesCollection.length;
      const next = imagesCollection[index] || imagesCollection[imagesCollection.length - 1];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },

    nextImage() {
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) activeImage = $(this);
      });

      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) imagesCollection.push($(this).children("img"));
        });
      } else {
        $(".item-column").each(function() {
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0;
      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) index = i;
      });
      index = (index + 1) % imagesCollection.length;
      const next = imagesCollection[index] || imagesCollection[0];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },

    createLightBox(gallery, lightboxId, navigation) {
      const id = lightboxId ? lightboxId : "galleryLightbox";
      gallery.append(
        `<div class="modal fade" id="${id}" tabindex="-1" role="dialog" aria-hidden="true" style="display:none;">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body" style="position:relative;">
                <button type="button" class="close btn btn-light" aria-label="Close" data-mg-close
                        style="position:absolute;top:8px;right:8px;z-index:2;">&times;</button>
                ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;z-index:2;"><</div>' : '<span style="display:none;" />'}
                <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clic"/>
                ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;z-index:2;">></div>' : '<span style="display:none;" />'}
              </div>
            </div>
          </div>
        </div>`
      );
    },

    showItemTags(gallery, position, tags) {
      var tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active"><span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
      if (position === "bottom") gallery.append(tagsRow);
      else if (position === "top") gallery.prepend(tagsRow);
      else console.error(`Unknown tags position: ${position}`);
    },

    filterByTag() {
      if ($(this).hasClass("active-tag")) return;
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active active-tag");

      var tag = $(this).data("images-toggle");
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
