/*!
 * jQuery myVideo plugin
 * Version 0.05 (03-Nov-2026)
 * @requires jQuery v1.7 or later
 *
 * Examples at: http://3wa.tw/demo/htm/myVideo
 * Copyright (c) 2020-2026 Feather Mountain (https://3wa.tw)
 * licensed under the MIT
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Require:
 *  jQuery
 * Special thanks to https://codepen.io/benjaminhoegh/pen/VQRGwx #benjaminhoegh
 */
(function ($) {
    var instanceId = 0;
    //From : https://stackoverflow.com/questions/1117086/how-to-create-a-jquery-plugin-with-methods
    //From : https://sites.google.com/site/jwztrialanderror/home/javascript/how-to-build-jquery-plugin

    $.fn.myVideo = function (opts) {
        if (opts === 'destroy') {
            return this.each(function () {
                var player = $(this).data('myVideo');
                if (player) player.destroy();
            });
        }
        if (this.length !== 1) return this.each(function () { $(this).myVideo(opts); });
        var previous = this.data('myVideo');
        if (previous) previous.destroy();
        var thIs = this;
        var VERSION = '0.05';
        var ns = '.myVideo' + (++instanceId);
        var original = {src: this.attr('src'), poster: this.attr('poster'), preload: this.attr('preload'), controls: this.prop('controls'), loop: this.prop('loop')};
        var doms = {
            dom_videoContainer: null,
            js_video: null,
            ctx: null
        };
        var sources = [];
        var default_opts = {
            width: '640px',
            height: '480px',
            orin_width: '640px',
            orin_height: '480px',
            //https://stackoverflow.com/questions/14904623/detect-aspect-ratio-html5-video
            videoWidth: 0,
            videoHeight: 0,
            merge: false,
            event: false,
            loop: true,
            preloadNext: true,
            loadTimeout: 15000
        };
        var now_playIndex = 0;
        var timer = null;
        var savedVolume = 100;
        var videoCurrentTime = 0;
        var videoDuration = 0;
        var totalDuration = 0;
        var timelineReady = false;
        var shouldPlay = false;
        var switching = false;
        var pendingTime = null;
        var retryTime = 0;
        var playbackError = false;
        var playPending = false;
        var playSequence = 0;
        var sourceSequence = 0;
        var loadTimer = null;
        var preloadVideo = null;
        var preloadIndex = -1;
        var preloadFailedIndex = -1;
        var preloadTimer = null;
        var probes = [];
        var destroyed = false;
        var removalObserver = null;
        var g = {
            "laba_on": "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"29px\" height=\"23px\" viewBox=\"0 0 29 23\" enable-background=\"new 0 0 29 23\" xml:space=\"preserve\">  <image id=\"image0\" width=\"29\" height=\"23\" x=\"0\" y=\"0\" \
                    href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAXCAQAAABdAYziAAAABGdBTUEAALGPC/xhBQAAACBjSFJN \
                AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZ \
                cwAACxIAAAsSAdLdfvwAAAAHdElNRQfkCB4ODzBqaJkwAAABIElEQVQ4y5XUMVKEMBTG8b+cwIoW \
                2p3ZGautA0ewsl5bK2ccS4ej7AEs7YO1lcXS2IRWC/UEnwUBlxAEX4oHj/mFFHkPMbOMDnJSUK1k \
                ZbrneWjVxbhupR4vQU2+dXiGnsJf2r8ZSZKJ0THUSd0TWUmHKb0LoCJHvZfklId0GtOj7uUk7ZPA \
                xuIaAMMzNXDJBzVwkbAclha4Ah6BjCdegGwNddTABmiAfMhaCoRKSe9CqaQvnz/X/BVspHa+jpb+ \
                kBvA+fy9jj54uvV0C7g11FAAR2Dn6W4trYCWhpwCePPZJZyNViwKoOZISUZLQ0kGvIYX8XbhDh+U \
                ysbv8Hzn2KFzFO+c5X4dtvjPgElldCP9NSXGOBxrC7PpFIe1qp+IPx7eUIrQWBNPAAAAJXRFWHRk \
                YXRlOmNyZWF0ZQAyMDIwLTA4LTMwVDE0OjE0OjU1KzAwOjAw2az1agAAACV0RVh0ZGF0ZTptb2Rp \
                ZnkAMjAyMC0wOC0zMFQxNDoxNDo1NSswMDowMKjxTdYAAAAASUVORK5CYII=\" /> \
                </svg>",
            "laba_off": "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"29px\" height=\"26px\" viewBox=\"0 0 29 26\" enable-background=\"new 0 0 29 26\" xml:space=\"preserve\">  <image id=\"image0\" width=\"29\" height=\"26\" x=\"0\" y=\"0\" \
                    href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAaCAQAAADhn588AAAABGdBTUEAALGPC/xhBQAAACBjSFJN \
                AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZ \
                cwAACxIAAAsSAdLdfvwAAAAHdElNRQfkCB4OLxGzha3MAAABg0lEQVQ4y52UMUsDQRCFv01sBbHQ \
                wiIRq0DAxgipLmIsLaysIyJpbWwVBBv/RGxFrCxs5CLYBQubNDYnKQQlqIiNzbPI3uWytxjjTjH7 \
                jv32BvbNGPHflXO0zAkrAAS0iHBvPiIkiM+mQ5LEteoKFMrKkQglhQqERtCe4tNtdSQvGsMOWkuO \
                f6MMGqtAkhTIKXg3TThogiiU1HJRdJOBs6UeSIpUdFF5ULfUhiJJjZzDpt8JM9js2Me6pQ1s8Uob \
                WHbflQxcIeQJ2AYugAJXdIDCrygIs0eeNlACukAxyRq3uhxrU9KL0Jykd5vfpsZatcQ6fc/3mfEo \
                qpq8BkWWgMjmj9x4FLRq4AsoW7QMRH9CQZhZqlQsWpkABS2aJnXgkSK1AWpGIrsObZ4nYIEeXdYo \
                AA+uEfeTPh368SxlzY7mFfo9TKrJh/a/S8S59bSnc7IwQkt6Tv577+9XHz7QGyP9lJkSfjjWzQTt \
                Z2eTHx7qU4sGtj81SVymrzITjfBpPofiB6rIcfHt6QCoAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIw \
                LTA4LTMwVDE0OjQ2OjU2KzAwOjAwneaTiAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMC0wOC0zMFQx \
                NDo0Njo1NiswMDowMOy7KzQAAAAASUVORK5CYII=\" /> \
                </svg>",
            "setting": "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"29px\" height=\"30px\" viewBox=\"0 0 29 30\" enable-background=\"new 0 0 29 30\" xml:space=\"preserve\">  <image id=\"image0\" width=\"29\" height=\"30\" x=\"0\" y=\"0\" \
                    href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAeCAQAAAB6Dt0qAAAABGdBTUEAALGPC/xhBQAAACBjSFJN \
                AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZ \
                cwAACxIAAAsSAdLdfvwAAAAHdElNRQfkCB4PASGfmf57AAABo0lEQVQ4y6WVu0oDQRSG/0hYG7fw \
                hiiI4KXQxngrrURIniJRS32WVD5DCu1MZWUhxEIQiaVREAWN6YxgCs1nsck6mZ1NjJ5t5pzzf8We \
                +WcmgRwxrXMNhdm7NvUYFSVdpFY0Y2SjSrnQASc6a+VzLpEbXbDy+W7otlJhzdeqpVqVH65T2m6t \
                EGKJBk0uyOGzxyvRqLKLT44LmjRYREiIAYqhpE58vIWrIokAzfBFf/FFBolBbvoEAcp44iC2/cQl \
                T7HdA3HrbJyxTjDCdc6ciluxRiVSPsJrgUJ4HEUUFdaEGDcmDPDMsAEKMcxzh6LIGK19TVIwGnkL \
                FCJv9AskES03fapmeOfK4TqzVtNnnIcTv6sFqKcpo7biQM3apLy2hyc4tcY0Yv3piDWmUyaQ2OC+ \
                5+YcRxT3bPzLEvt/NOK+8CjTf5TxhEj/4dClAzclOAmLb12An95J+6iLRRo0KZHFZ4eqA3shh0+W \
                Ek0+fi4YIbZYDjfDp2SBJYbC7jJbwUq4vkMLPXSp3PdwpUfecQ93xl2PXFLcm3OtB+O5quvaJfoG \
                8GLACzt5BY0AAAAldEVYdGRhdGU6Y3JlYXRlADIwMjAtMDgtMzBUMTU6MDE6MjMrMDA6MDBKiARI \
                AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIwLTA4LTMwVDE1OjAxOjIzKzAwOjAwO9W89AAAAABJRU5E \
                rkJggg==\" /> \
                </svg>"

        };
        this.getSource = function () {
            return sources;
        }
        var init = function (thIs, opts) {
            if (opts == null || typeof (opts) != "object") {
                run(thIs);
                return;
            }
            for (var key in default_opts) {
                if (typeof (opts[key]) != "undefined") {
                    default_opts[key] = opts[key];
                }
            }
            run(thIs);
        }
        function init_ui(video_dom) {
            video_dom.prop('controls', false).prop('loop', false);
            video_dom.wrapAll("<div class=\"videoContainer myvideo-v05\" />");
            doms.dom_videoContainer = video_dom.closest(".videoContainer").eq(0);
            doms.dom_videoContainer.append(" \
          <canvas class=\"canvas\"></canvas> \
          <div class=\"control\"> \
                <a class=\"play video-play noselect\" title=\"播放/暫停\">►</a> \
                <div class=\"progress_hover\"> \
              <div class=\"progress\"> \
                     <div class=\"progress-bar\"></div> \
               <div class=\"progress-event-bar\"></div> \
              </div> \
                </div> \
                <div class=\"time\"> \
                    <span class=\"ctime\">0:00</span> \
                    <span class=\"stime\"> / </span> \
                    <span class=\"ttime\">0:00</span> \
                </div> \
                <div class=\"volume\"> \
                    <a class=\"toggle-sound video-volume-high\" title=\"音量\"> \
                "+ g.laba_on + " \
              </a> \
                    <div class=\"volume-piller\"> \
                        <input type=\"range\" min=\"0\" max=\"100\" value=\"100\" class=\"volume-slider\"> \
                    </div> \
                </div> \
            <div class=\"right_div\"> \
              <div class=\"setting\"> \
                <a class=\"video-setting noselect\" title=\"設定\"> \
                  "+ g.setting + " \
                </a> \
              </div> \
                <a reqc=\"airplay\" class=\"video-airplay\"></a> \
                <a class=\"fullscreen video-fullscreen-enter\"> \
                <div class=\"fullscreen_div\" title=\"全螢幕\"></div> \
              </a> \
            </div> \
            <div class=\"setting_div noselect\"> \
              <div class=\"author_info\">myVideo - "+ VERSION + "</div> \
              <hr> \
              播放速度： \
              <select class=\"play_speed_select\" reqc='play_speed_select'> \
                <option value=\"0.10\">0.10</option> \
                <option value=\"0.15\">0.15</option> \
                <option value=\"0.20\">0.20</option> \
                <option value=\"0.25\">0.25</option> \
                <option value=\"0.50\">0.50</option> \
                <option value=\"0.75\">0.75</option> \
                <option value=\"1\" selected>正常</option> \
              </select> \
              <label class=\"myvideo-option\"><input type=\"checkbox\" class=\"loop-toggle\"> 循環播放</label> \
              <label class=\"myvideo-option\"><input type=\"checkbox\" class=\"preload-toggle\"> 預載下一段</label> \
            </div> \
          </div> \
        </div>");
            doms.dom_videoContainer.append('<div class="video-status" role="status" aria-live="polite" style="display:none"></div>');
            var m = new Array();
            for (var i = 1.25, max_i = 16; i <= max_i; i += 0.25) {
                var d = "<option value=\"" + i + "\">" + i + "</option>";
                m.push(d);
            }
            doms.dom_videoContainer.find("select[reqc='play_speed_select']").append(m.join(""));
            resize(default_opts.width, default_opts.height);
            default_opts.orin_width = default_opts.width;
            default_opts.orin_height = default_opts.height;
            doms.js_video = video_dom[0];
            //doms.ctx = doms.dom_videoContainer.find(".canvas")[0].getContext("2d");
        }
        function init_events(video_dom) {
            var container = doms.dom_videoContainer;
            container.find('.canvas').on('click' + ns, playVideo);
            video_dom.on('click' + ns, playVideo);
            container.find('.play').on('click' + ns, playVideo);
            video_dom.on('mouseenter' + ns + ' mouseleave' + ns, function (e) {
                video_dom.data('isHovered', e.type === 'mouseenter');
            });
            container.find('.volume-slider').on('input' + ns, function () {
                doms.js_video.muted = false;
                setVolume(parseFloat(this.value));
            });
            container.find('.toggle-sound').on('click' + ns, function () {
                if (doms.js_video.muted) {
                    doms.js_video.muted = false;
                    setVolume(savedVolume);
                } else {
                    savedVolume = doms.js_video.volume * 100;
                    doms.js_video.muted = true;
                    syncVolume();
                }
            });
            setVolume(doms.js_video.volume * 100);
            video_dom.on('volumechange' + ns, syncVolume);
            container.find('.setting').on('click' + ns, function () {
                container.find('.setting_div').css('max-height', Math.max(70, container.height() - 40) + 'px').toggle();
            });
            container.find('.play_speed_select').on('change' + ns, function () {
                rate_change(video_dom);
            });
            container.find('.loop-toggle').prop('checked', default_opts.loop).on('change' + ns, function () {
                default_opts.loop = this.checked;
                preloadNextVideo();
            });
            container.find('.preload-toggle').prop('checked', default_opts.preloadNext).on('change' + ns, function () {
                default_opts.preloadNext = this.checked;
                preloadFailedIndex = -1;
                preloadNextVideo();
            });
            container.on('mouseenter' + ns + ' mousemove' + ns, function () { viewContorls(3000); });
            container.find('.fullscreen').on('click' + ns, function () {
                var element = container[0];
                var result;
                if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                    var exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
                    if (exit) result = exit.call(document);
                } else {
                    var enter = element.requestFullscreen || element.webkitRequestFullscreen || element.mozRequestFullScreen || element.msRequestFullscreen;
                    if (enter) result = enter.call(element);
                }
                if (result && result.catch) result.catch(function () { showStatus('無法進入全螢幕，請再試一次。'); });
            });
            $(document).on('fullscreenchange' + ns + ' webkitfullscreenchange' + ns, function () {
                var full = document.fullscreenElement === container[0] || document.webkitFullscreenElement === container[0];
                container.find('.fullscreen').toggleClass('video-fullscreen-enter', !full).toggleClass('video-fullscreen-exit', full);
            });
            doms.dom_scrubber = container.find('.progress_hover');
            doms.dom_progress = container.find('.progress-bar');
            var down = window.PointerEvent ? 'pointerdown' : 'mousedown';
            var move = window.PointerEvent ? 'pointermove' : 'mousemove';
            var up = window.PointerEvent ? 'pointerup' : 'mouseup';
            var dragging = false;
            var pointerId = null;
            doms.dom_scrubber.on(down + ns, function (e) {
                if (e.button != null && e.button !== 0) return;
                dragging = true;
                pointerId = e.originalEvent ? e.originalEvent.pointerId : e.pointerId;
                scrubberMouseDownHandler(e);
            });
            $(document).on(move + ns, function (e) {
                var id = e.originalEvent ? e.originalEvent.pointerId : e.pointerId;
                if (dragging && (pointerId == null || id === pointerId)) scrubberMouseDownHandler(e);
            }).on(up + ns + ' pointercancel' + ns, function (e) {
                var id = e.originalEvent ? e.originalEvent.pointerId : e.pointerId;
                if (pointerId == null || id === pointerId) dragging = false;
            });
            $(window).on('blur' + ns, function () { dragging = false; });
            $(document).on('keyup' + ns, function (e) {
                if (e.which !== 32 || $(e.target).is('input, select, textarea, button, [contenteditable]')) return;
                var full = document.fullscreenElement === container[0] || document.webkitFullscreenElement === container[0];
                if (full || video_dom.data('isHovered')) {
                    e.preventDefault();
                    playVideo();
                    viewContorls(3000);
                }
            });
            video_dom.on('loadedmetadata' + ns, function () {
                if (destroyed || playbackError) return;
                if (sources[now_playIndex] && sources[now_playIndex].duration == null && validDuration(this.duration)) {
                    sources[now_playIndex].duration = this.duration;
                    rebuildTimeline();
                }
                applyPendingSeek();
            }).on('seeked' + ns + ' canplay' + ns, function () {
                if (destroyed || playbackError) return;
                if (pendingTime != null) applyPendingSeek();
                if (pendingTime == null && !this.seeking && this.readyState >= 3) {
                    switching = false;
                    clearTimeout(loadTimer);
                    loadTimer = null;
                    showMetadataStatus();
                    if (shouldPlay) safePlay();
                    preloadNextVideo();
                }
                videoTimeUpdateHandler();
            }).on('timeupdate' + ns, videoTimeUpdateHandler)
              .on('play' + ns + ' playing' + ns + ' pause' + ns, function (e) {
                if (e.type === 'pause' && this.paused && !this.ended && !this.seeking && !switching) shouldPlay = false;
                if (e.type === 'playing' && !this.paused && !playbackError) {
                    shouldPlay = true;
                    clearTimeout(loadTimer);
                    loadTimer = null;
                }
                syncPlayButton();
            }).on('error' + ns, function () {
                mediaFailed('第 ' + (now_playIndex + 1) + ' 段影片無法載入，請按播放重試。');
            }).on('ended' + ns, function () {
                if (destroyed || switching || !shouldPlay) return;
                if (now_playIndex === sources.length - 1 && !default_opts.loop) {
                    shouldPlay = false;
                    syncPlayButton();
                    videoTimeUpdateHandler();
                    return;
                }
                changeSource((now_playIndex + 1) % sources.length, 0, true, true);
            });
            var airPlay = container.find("a[reqc='airplay']");
            if (window.WebKitPlaybackTargetAvailabilityEvent && doms.js_video.webkitShowPlaybackTargetPicker) {
                video_dom.on('webkitplaybacktargetavailabilitychanged' + ns, function (e) {
                    airPlay.toggle(e.originalEvent.availability === 'available');
                });
                airPlay.on('click' + ns, function () { doms.js_video.webkitShowPlaybackTargetPicker(); });
            } else {
                airPlay.hide();
            }
        }
        function validDuration(value) {
            return typeof value === 'number' && isFinite(value) && value > 0;
        }
        function showStatus(message) {
            if (destroyed) return;
            doms.dom_videoContainer.find('.video-status').text(message).toggle(!!message);
        }
        function warn(message) {
            if (window.console && window.console.warn) window.console.warn('myVideo: ' + message);
        }
        function showMetadataStatus() {
            for (var i = 0; i < sources.length; i++) {
                if (sources[i].metadataState === 'error' && !validDuration(sources[i].duration)) {
                    showStatus('無法讀取第 ' + (i + 1) + ' 段長度，請按播放重試。');
                    return;
                }
            }
            showStatus('');
        }
        function syncPlayButton() {
            if (destroyed) return;
            var playing = !doms.js_video.paused && !doms.js_video.ended && !playbackError;
            doms.dom_videoContainer.find('.play').text(playing ? '❚❚' : '►')
                .toggleClass('video-play', !playing).toggleClass('video-pause', playing);
        }
        function safePlay() {
            if (destroyed || !shouldPlay || playPending || playbackError) return;
            if (!doms.js_video.paused && !doms.js_video.ended) return;
            var sequence = ++playSequence;
            rate_change($(doms.js_video));
            playPending = true;
            function failed(error) {
                if (destroyed || sequence !== playSequence) return;
                playPending = false;
                if (error && error.name === 'AbortError') return;
                mediaFailed('影片無法播放，請按播放重試。');
            }
            try {
                var result = doms.js_video.play();
                if (result && result.then) {
                    result.then(function () {
                        if (destroyed || sequence !== playSequence) return;
                        playPending = false;
                        syncPlayButton();
                    }, failed);
                } else {
                    playPending = false;
                }
            } catch (error) { failed(error); }
        }
        function mediaFailed(message) {
            if (destroyed || playbackError) return;
            playbackError = true;
            shouldPlay = false;
            switching = false;
            pendingTime = null;
            playPending = false;
            playSequence++;
            clearTimeout(loadTimer);
            loadTimer = null;
            doms.js_video.pause();
            showStatus(message);
            syncPlayButton();
            warn(message);
        }
        function changeSource(index, seconds, resume, force) {
            if (destroyed || !sources[index]) return;
            var reload = force || index !== now_playIndex || !doms.js_video.getAttribute('src');
            var sequence = ++sourceSequence;
            shouldPlay = resume;
            switching = true;
            playbackError = false;
            playPending = false;
            playSequence++;
            pendingTime = Math.max(0, seconds);
            retryTime = pendingTime;
            doms.js_video.pause();
            now_playIndex = index;
            showStatus('');
            clearTimeout(loadTimer);
            loadTimer = setTimeout(function () {
                if (!destroyed && sequence === sourceSequence) mediaFailed('第 ' + (index + 1) + ' 段影片載入逾時，請按播放重試。');
            }, default_opts.loadTimeout);
            if (reload) {
                doms.js_video.src = sources[index].url;
                doms.js_video.load();
            } else if (doms.js_video.readyState >= 1) {
                applyPendingSeek();
            }
            videoTimeUpdateHandler();
            syncPlayButton();
        }
        function applyPendingSeek() {
            if (pendingTime == null || doms.js_video.readyState < 1) return;
            var time = pendingTime;
            if (validDuration(doms.js_video.duration)) time = Math.min(time, doms.js_video.duration);
            pendingTime = null;
            try { doms.js_video.currentTime = time; }
            catch (error) { mediaFailed('無法跳轉到指定時間，請按播放重試。'); return; }
            if (!doms.js_video.seeking && doms.js_video.readyState >= 3) {
                switching = false;
                clearTimeout(loadTimer);
                loadTimer = null;
                if (shouldPlay) safePlay();
            }
        }
        function videoTimeUpdateHandler() {
            if (destroyed || !sources.length) return;
            videoCurrentTime = pendingTime != null ? pendingTime : doms.js_video.currentTime;
            var source = sources[now_playIndex];
            var ct = videoCurrentTime;
            videoDuration = default_opts.merge ? totalDuration : (source.duration || doms.js_video.duration);
            if (default_opts.merge) ct = source.offset == null ? NaN : source.offset + Math.min(videoCurrentTime, source.duration || videoCurrentTime);
            doms.dom_videoContainer.find('.ctime').text(formatTime(ct));
            doms.dom_videoContainer.find('.ttime').text(formatTime(videoDuration));
            updateProgressWidth(validDuration(videoDuration) ? ct / videoDuration : 0);
        }
        function scrubberMouseDownHandler(e) {
            if (destroyed || !validDuration(videoDuration)) return;
            if (default_opts.merge && !timelineReady) return;
            var bar = doms.dom_videoContainer.find('.progress');
            var event = e.originalEvent || e;
            var pageX = event.pageX != null ? event.pageX : e.pageX;
            if (!isFinite(pageX) || !bar.width()) return;
            e.preventDefault();
            e.stopPropagation();
            $(doms.js_video).attr('poster', '');
            updateVideoTime((pageX - bar.offset().left) / bar.width());
        }
        function updateProgressWidth(percent) {
            if (!doms.dom_progress) return;
            percent = isFinite(percent) ? Math.max(0, Math.min(1, percent)) : 0;
            doms.dom_progress.width((percent * 100) + '%');
        }
        function updateVideoTime(percent) {
            percent = Math.max(0, Math.min(1, percent));
            var index = now_playIndex;
            var time = percent * videoDuration;
            if (default_opts.merge) {
                index = sources.length - 1;
                time = sources[index].duration;
                if (percent < 1) {
                    var target = percent * totalDuration;
                    for (var i = 0; i < sources.length; i++) {
                        if (target < sources[i].offset + sources[i].duration) {
                            index = i;
                            time = target - sources[i].offset;
                            break;
                        }
                    }
                }
            }
            changeSource(index, time, shouldPlay, false);
        }
        function formatTime(seconds) {
            if (!isFinite(seconds) || seconds == null || seconds < 0) return '--:--';
            var minutes = Math.floor(seconds / 60);
            seconds = Math.floor(seconds % 60);
            return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }
        function viewContorls(ms) {
            clearTimeout(timer);
            showControls();
            timer = setTimeout(function () {
                if (!destroyed && !doms.dom_videoContainer.find('.setting_div').is(':visible')) hideControls();
            }, ms);
        }
        function showControls() { doms.dom_videoContainer.find('.control').stop(true, true).fadeIn(150); }
        function hideControls() { doms.dom_videoContainer.find('.control').stop(true, true).fadeOut(150); }
        function syncVolume() {
            if (destroyed) return;
            var volume = doms.js_video.muted ? 0 : doms.js_video.volume * 100;
            doms.dom_videoContainer.find('.volume-slider').val(volume);
            doms.dom_videoContainer.find('.toggle-sound').html(volume > 0 ? g.laba_on : g.laba_off);
        }
        function setVolume(volume) {
            volume = isFinite(volume) ? Math.max(0, Math.min(100, volume)) : 100;
            doms.js_video.volume = volume / 100;
            syncVolume();
        }
        function rate_change(video_dom) {
            var rate = parseFloat(doms.dom_videoContainer.find('.play_speed_select').val());
            try { video_dom[0].playbackRate = rate; }
            catch (error) { showStatus('此瀏覽器不支援所選的播放速度。'); }
        }
        function playVideo() {
            if (destroyed || !sources.length) return;
            retryMetadata();
            if (shouldPlay || !doms.js_video.paused) {
                shouldPlay = false;
                playSequence++;
                playPending = false;
                doms.js_video.pause();
                syncPlayButton();
                return;
            }
            if (playbackError) {
                changeSource(now_playIndex, retryTime, true, true);
            } else if (doms.js_video.ended && now_playIndex === sources.length - 1) {
                changeSource(0, 0, true, true);
            } else {
                shouldPlay = true;
                safePlay();
            }
        }
        function rebuildTimeline() {
            var total = 0;
            timelineReady = true;
            for (var i = 0; i < sources.length; i++) {
                sources[i].offset = timelineReady ? total : null;
                if (!validDuration(sources[i].duration)) timelineReady = false;
                else total += sources[i].duration;
            }
            totalDuration = timelineReady ? total : NaN;
            var bar = doms.dom_videoContainer.find('.progress-event-bar').empty();
            if (default_opts.merge && default_opts.event && timelineReady && total > 0) {
                for (var i = 0; i < sources.length; i++) {
                    var events = sources[i].events;
                    if (!$.isArray(events)) continue;
                    for (var j = 0; j < events.length; j++) {
                        var percent = Number(events[j].event_percent);
                        if (!isFinite(percent) || percent < 0 || percent > 1) continue;
                        var time = sources[i].offset + sources[i].duration * percent;
                        events[j].event_ct = time;
                        // 標記文字可能來自外部資料，透過 DOM 設定屬性，避免混入 HTML。
                        $('<div class="myvideo-event-marker"></div>').attr('title', events[j].datetime || '')
                            .css('left', (time / total * 100) + '%').appendTo(bar);
                    }
                }
            }
            videoTimeUpdateHandler();
            if (!playbackError) showMetadataStatus();
        }
        function releaseVideo(video) {
            if (!video) return;
            video.onloadedmetadata = video.oncanplay = video.onerror = null;
            video.pause();
            video.removeAttribute('src');
            video.load();
            if (video.parentNode) video.parentNode.removeChild(video);
        }
        function auxiliaryVideo(className, preload) {
            var video = document.createElement('video');
            video.className = className;
            video.style.display = 'none';
            video.setAttribute('aria-hidden', 'true');
            video.setAttribute('playsinline', '');
            video.preload = preload;
            video.muted = true;
            var crossOrigin = doms.js_video.getAttribute('crossorigin');
            if (crossOrigin != null) video.setAttribute('crossorigin', crossOrigin);
            document.body.appendChild(video);
            return video;
        }
        function clearPreload() {
            clearTimeout(preloadTimer);
            preloadTimer = null;
            releaseVideo(preloadVideo);
            preloadVideo = null;
            preloadIndex = -1;
        }
        function preloadNextVideo() {
            if (destroyed) return;
            var index = now_playIndex + 1;
            if (index >= sources.length) index = default_opts.loop ? 0 : -1;
            if (!default_opts.preloadNext || sources.length < 2 || index < 0) { clearPreload(); return; }
            if (index === preloadIndex || index === preloadFailedIndex) return;
            clearPreload();
            preloadIndex = index;
            var video = preloadVideo = auxiliaryVideo('myvideo-preload', 'auto');
            video.onloadedmetadata = function () {
                if (destroyed || video !== preloadVideo) return;
                if (sources[index].duration == null && validDuration(video.duration)) {
                    sources[index].duration = video.duration;
                    rebuildTimeline();
                }
            };
            video.oncanplay = function () { clearTimeout(preloadTimer); preloadTimer = null; };
            function failed() {
                if (destroyed || video !== preloadVideo) return;
                preloadFailedIndex = index;
                warn('第 ' + (index + 1) + ' 段預載未完成，切換時將正常載入。');
                clearPreload();
            }
            video.onerror = failed;
            preloadTimer = setTimeout(failed, default_opts.loadTimeout);
            video.src = sources[index].url;
            video.load();
        }
        function loadMetadata(index) {
            var source = sources[index];
            source.metadataState = 'loading';
            var probe = {video: auxiliaryVideo('myvideo-metadata', 'metadata'), timer: null};
            probes.push(probe);
            function finish(error) {
                if (!probe.video) return;
                var duration = probe.video.duration;
                clearTimeout(probe.timer);
                releaseVideo(probe.video);
                probe.video = null;
                if (destroyed) return;
                if ((!error && validDuration(duration)) || validDuration(source.duration)) {
                    if (!validDuration(source.duration)) source.duration = duration;
                    source.metadataState = 'ready';
                    rebuildTimeline();
                } else {
                    source.metadataState = 'error';
                    showStatus('無法讀取第 ' + (index + 1) + ' 段長度，請按播放重試。');
                    warn('第 ' + (index + 1) + ' 段 metadata 載入失敗。');
                }
                pumpMetadata();
            }
            probe.video.onloadedmetadata = function () { finish(false); };
            probe.video.onerror = function () { finish(true); };
            probe.timer = setTimeout(function () { finish(true); }, default_opts.loadTimeout);
            probe.video.src = source.url;
            probe.video.load();
        }
        function pumpMetadata() {
            if (destroyed) return;
            var active = 0;
            for (var i = 0; i < probes.length; i++) if (probes[i].video) active++;
            // 只同時探測兩段長度，避免長播放清單搶占目前影片的連線。
            for (var i = 0; i < sources.length && active < 2; i++) {
                if (i !== now_playIndex && sources[i].duration == null && !sources[i].metadataState) {
                    loadMetadata(i);
                    active++;
                }
            }
        }
        function retryMetadata() {
            for (var i = 0; i < sources.length; i++) {
                if (sources[i].metadataState === 'error') sources[i].metadataState = null;
            }
            pumpMetadata();
        }
        function load_videos(video_dom) {
            video_dom.find('source').each(function () {
                var source = {url: $(this).attr('src'), duration: null, events: null};
                if (!source.url) return;
                var duration = parseFloat($(this).attr('req_duration'));
                if (validDuration(duration)) source.duration = duration;
                var events = $(this).attr('req_events');
                if (events) {
                    try { source.events = JSON.parse(atob(events)); }
                    catch (error) { warn('忽略無法解析的事件標記資料。'); }
                }
                sources.push(source);
            });
            if (!sources.length && original.src) sources.push({url: original.src, duration: null, events: null});
            if (!sources.length) { showStatus('沒有可播放的影片來源。'); return; }
            rebuildTimeline();
            changeSource(0, 0, false, true);
            pumpMetadata();
        }
        function destroy(restore) {
            if (destroyed) return;
            destroyed = true;
            shouldPlay = false;
            playSequence++;
            sourceSequence++;
            clearTimeout(timer);
            clearTimeout(loadTimer);
            if (removalObserver) removalObserver.disconnect();
            $(document).off(ns);
            $(window).off(ns);
            thIs.off(ns).removeData('myVideo');
            doms.dom_videoContainer.off(ns).find('*').off(ns).stop(true, true);
            clearPreload();
            for (var i = 0; i < probes.length; i++) {
                clearTimeout(probes[i].timer);
                releaseVideo(probes[i].video);
                probes[i].video = null;
            }
            doms.js_video.pause();
            if (restore !== false) {
                doms.dom_videoContainer.before(thIs);
                doms.dom_videoContainer.remove();
                thIs.prop('controls', original.controls).prop('loop', original.loop);
                $.each(['src', 'poster', 'preload'], function (_, key) {
                    if (original[key] == null) thIs.removeAttr(key);
                    else thIs.attr(key, original[key]);
                });
            } else {
                doms.js_video.preload = 'none';
                doms.js_video.removeAttribute('src');
            }
            doms.js_video.load();
        }
        var run = function (video_dom) {
            default_opts.loadTimeout = Number(default_opts.loadTimeout);
            if (!isFinite(default_opts.loadTimeout) || default_opts.loadTimeout <= 0) default_opts.loadTimeout = 15000;
            init_ui(video_dom);
            init_events(video_dom);
            //start load first movie
            load_videos(video_dom);
            if (window.MutationObserver) {
                var wasConnected = $.contains(document.documentElement, video_dom[0]);
                removalObserver = new MutationObserver(function () {
                    var connected = $.contains(document.documentElement, video_dom[0]);
                    if (wasConnected && !connected) destroy(false);
                    wasConnected = connected;
                });
                removalObserver.observe(document.documentElement, {childList: true, subtree: true});
            }
        }
        function resize(w, h) {
            default_opts.width = w;
            default_opts.height = h;
            doms.dom_videoContainer.css({
                width: default_opts.width,
                height: default_opts.height
            });
            //doms.dom_videoContainer.find("video")[0].videoWidth=default_opts.width;
            //doms.dom_videoContainer.find("video")[0].videoHeight=default_opts.height;
            /*doms.dom_videoContainer.find("video").css({
              width:default_opts.width,
              height:"auto"
            });
            */

            /*doms.dom_videoContainer.find(".canvas").css({
              width:default_opts.width,
              height:default_opts.height
            });
            doms.dom_videoContainer.find(".canvas").attr('width',default_opts.width);
            doms.dom_videoContainer.find(".canvas").attr('height',default_opts.height);
            */
        }
        //preset
        this.destroy = function () { destroy(true); return thIs; };
        this.data('myVideo', {destroy: this.destroy, getSource: this.getSource});
        init(thIs, opts);
        return this;
    };
})(jQuery);
