; (function($, window) {
    var defaults = {
        baseClass: '',
        position: '',
        adapters: []
    };

    function Social(config) {
        this.config = config;
    }

    $.extend(Social.prototype, {
        shareText: function(adapter, popup) {
            var url = adapter.buildUrl.call(this, this.getSelection(popup));

            if (typeof url === 'object') {
                var parts = [];

                for (var index in url) {
                    if (url.hasOwnProperty(index)) {
                        parts.push(index + '=' + url[index]);
                    }
                }

                url = parts.join('&');
            }

            window.open(adapter.url + '?' + url, '', 'width=715,height=450');
        },
        getPopup: function() {
            var popup = $(document.createElement('span'));
            popup.addClass(this.config.baseClass);

            this.config.adapters.forEach(function (item, key) {
                var button = $(document.createElement('span'));
                button.addClass(this.config.baseClass + '__link');
                button.addClass(this.config.baseClass + '__link--' + item.logo);
                button.on('mousedown', this.shareText.bind(this, item, popup));

                popup.append(button);
            }.bind(this));

            return popup[0];
        },
        getSelection: function(popup) {
            var text = '';

            if(popup && popup.data('share')) {
                return popup.data('share');
            }

            if (window.getSelection) {
                text = window.getSelection().toString();
            } else if (document.getSelection) {
                text = document.getSelection().toString();
            } else if (document.selection && document.selection.type != "Control") {
                text = document.selection.createRange().text;
            }

            return text;
        }
    });

    $.fn.select = function(config) {
        var social = new Social($.extend({}, defaults, config));

        var coordinates = {
            y: 0,
            x: 0
        };

        this.each(function(key, item) {
            $(item).on('mousedown', function(event) {
                // Remove all the popup elements from the document.
                $('.' + social.config.baseClass).each(function(key, item) {
                    if($(item).parent('.tw-share-mark').length === 0) {
                        $(item).remove();
                    }
                });

                // Get the coordinates
                coordinates.y = event.pageY;
                coordinates.x = event.pageX;
            }.bind(this));

            $(item).on('mouseup', function(event) {
                setTimeout(function () {
                    var selection = social.getSelection(),
                        top = (event.clientY <= coordinates.y) ? coordinates.y : event.pageY,
                        center = (coordinates.x + event.pageX) / 2,
                        css = {
                            top: 0,
                            left: 0,
                            extra_class: ''
                        };

                    if (selection) {
                        // get the position.
                        switch (social.config.position) {
                            case 'top':
                                css.top = (top - 50);
                                css.left = (center - ((social.config.adapters.length / 2) * 24));
                                css.extra_class = 'bottom';
                                break;
                            default:
                                css.top = event.pageY;
                                css.left = event.pageX;
                                break;
                        }

                        var popup = $(social.getPopup());
                        if (css.extra_class) {
                            popup.addClass(social.config.baseClass + '--' + css.extra_class);
                        }
                        popup.css('top', css.top);
                        popup.css('left', css.left);

                        $(document.body).append(popup[0]);
                    }
                }.bind(this), 100);
            }.bind(this))
        }.bind(this));
    };

    $.fn.highlight = function(config) {
        var social = new Social($.extend({}, defaults, config));

        this.each(function() {
            var popup = $(social.getPopup());
            popup.data('share', $(this).text());

            $(this).off('mouseup, mousedown');
            $(this).append(popup[0]);
        });
    };
})(window.jQuery, window);