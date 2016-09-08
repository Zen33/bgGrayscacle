/**
 * 背景灰度控件
 * 
 * @API: $(selector).bgGrayscale();
 * @API: $(selector).bgGrayscale('clear');还原初始状态
 */
(function ($, window, document, undefined) {
    'use strict';
    $.fn.bgGrayscale = function () {
        var args = arguments;
        var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
        var props = {
            supportedCssFilterGrayscale: (function () { // 是否支持原生滤镜
                var el = document.createElement('div');
                el.style.cssText = prefixes.join('filter:grayscale(1);');
                return !!el.style.length && ((document.documentMode === undefined || document.documentMode > 9));
            }()),
            getGrayImage: function (src) { // 针对不支持原生滤镜的Plan B
                var supportedCanvas = !!document.createElement('canvas').getContext;
                if (supportedCanvas) {
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    var imageData;
                    var px;
                    var len;
                    var i = 0;
                    var gray;
                    var img = new Image();
                    img.src = src;
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context.drawImage(img, 0, 0);
                    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    px = imageData.data;
                    len = px.length;
                    for (; i < len; i += 4) {
                        gray = px[i] * .3 + px[i + 1] * .59 + px[i + 2] * .11;
                        px[i] = px[i + 1] = px[i + 2] = gray;
                    }
                    context.putImageData(imageData, 0, 0);
                    return canvas.toDataURL();
                } else {
                    return src;
                }
            },
            setClass: function (name, str) { // 配置class
                var style = document.createElement('style');
                var contents = name + '{' + str + '}';
                style.appendChild(document.createTextNode(contents));
                document.getElementsByTagName('head')[0].appendChild(style);
            },
            hasClass: function (name) { // 是否已存在该class
                var i = 0;
                var len = document.styleSheets.length;
                var sheet;
                for (; i < len; i += 1) {
                    sheet = document.styleSheets[i];
                    if (sheet.cssRules.length === 1 && sheet.cssRules[0].selectorText === '.' + name) {
                        return true;
                    }
                }
                return false;
            }
        };
        var methods = {
            init: function (options) { // 控件初始化
                var defaults = {
                    otherCssText: 'opacity:.7;cursor:default;', // 补充样式
                    peer: true // 同类（针对批量操作，如果为同一类元素则为true）
                };
                return this.each(function () {
                    var self = this;
                    var $self = $(self);
                    var opts = $.extend(defaults, options);
                    var bgUrl;
                    var contents;
                    var seed = '';
                    var curClass;
                    if ($self.hasClass('grayscale')) {
                        return;
                    }
                    if (!opts.peer) {
                        seed = (new Date()).getTime();
                    }
                    curClass = 'bg-grayscale' + seed;
                    if (!props.hasClass(curClass)) { // 如果不存在该class，则创建
                        if (props.supportedCssFilterGrayscale) {
                            contents = prefixes.join('filter:grayscale(1);') + opts.otherCssText;
                        } else {
                            bgUrl = $self.css('backgroundImage').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                            contents = 'background-image: url(' + props.getGrayImage(bgUrl) + ');' + opts.otherCssText;
                        }
                        props.setClass('.' + curClass, contents);
                    }
                    $self.data('bgGrayscale', curClass).addClass(curClass);
                });
            },
            clear: function () { // 还原到初始状态
                return this.each(function () {
                    var curClass = $(this).data('bgGrayscale');
                    $(this).removeClass(curClass).removeData('bgGrayscale');
                });
            }
        };
        if (args[0] && methods[args[0]]) {
            return methods[args[0]].apply(this, [].slice.call(args, 1));
        } else if (typeof args[0] === 'object' || !args.length) {
            return methods.init.apply(this, args);
        }
    };
}(jQuery, window, document));