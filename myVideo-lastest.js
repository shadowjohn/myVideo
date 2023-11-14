/*!
 * jQuery myVideo plugin
 * Version 0.4 (17-Oct-2023)
 * @requires jQuery v1.2.3 or later
 *
 * Examples at: http://3wa.tw/demo/htm/myVideo
 * Copyright (c) 2020-2023 Feather Mountain (https://3wa.tw)
 * licensed under the MIT
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Require:
 *  jQuery
 *  jQuery-UI
 * Special thanks to https://codepen.io/benjaminhoegh/pen/VQRGwx #benjaminhoegh
 */
(function ($) {
    //From : https://stackoverflow.com/questions/1117086/how-to-create-a-jquery-plugin-with-methods
    //From : https://sites.google.com/site/jwztrialanderror/home/javascript/how-to-build-jquery-plugin    

    $.fn.myVideo = function (opts) {
        var thIs = this;
        var VERSION = 0.4;
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
            event: false
        };
        var now_playIndex = 0;
        var timer = null;
        var savedVolume = 0.8;
        var videoCurrentTime = 0;
        var videoDuration = 0;
        var autoplayFixWidth = true;
        var allowBarChange = true;
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
            video_dom.prop('controls', false);
            video_dom.wrapAll("<div class=\"videoContainer\" />");
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
              功能設定 \
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
            </div> \
          </div> \
        </div>");
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
            doms.dom_videoContainer.find(".canvas").unbind("click").click({ 'video_dom': video_dom }, function (e) {
                video_dom.trigger("click");
            });

            //拉動喇叭
            //From : https://jsfiddle.net/girlie_mac/GKY2A/
            var p = doms.dom_videoContainer.find(".volume-slider")[0]
            p.addEventListener("input", function () {
                setVolume(parseFloat(p.value));
            }, false);

            setVolume(100); // Set default volume to 80%
            video_dom.on('mouseenter mouseleave', function (e) {
                $(this).data('isHovered', e.type === 'mouseenter');
            });
            video_dom.click(function () {
                playVideo();
            });
            // Play/Pause control clicked
            doms.dom_videoContainer.find(".play").click(function () {
                playVideo();
            });
            /*
              播完繼續播下一個
            */
            video_dom.bind('ended', function (e) {
                //play next song          
                video_dom[0].pause();
                //抓最後一個影格
                //doms.ctx.globalAlpha=1;          
                //doms.ctx.drawImage(doms.js_video, 0, 0, doms.dom_videoContainer.find(".canvas")[0].width, doms.dom_videoContainer.find(".canvas")[0].height);
                //canvasShowHide(false);

                allowBarChange = false;
                now_playIndex = (now_playIndex + 1) % sources.length;
                //change poster ?
                video_dom.attr('poster', '');
                //alert(now_playIndex);
                doms.js_video.onloadstart = function () {
                    video_dom[0].currentTime = 0;
                    switch (doms.dom_videoContainer.find(".play").text()) {
                        case '❚❚':
                            doms.js_video.play();
                            /*doms.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                            doms.ctx.fillRect(0, 0, 255, 255);
                            doms.ctx.globalCompositeOperation = "lighter";
                            doms.ctx.globalAlpha=0.5;
                            */
                            //hide white
                            //setTimeout(function(){
                            //canvasShowHide(false);
                            //},500);                  
                            break;
                    }
                    allowBarChange = true;
                }
                video_dom.attr('src', sources[now_playIndex]["url"]);
            });
            /*
            * Setting
            * ---------------------------------------
            */
            doms.dom_videoContainer.find('.setting').click({ "doms": doms }, function (e) {
                e.data.doms.dom_videoContainer.find(".setting_div").toggle();
            });
            doms.dom_videoContainer.find('.play_speed_select').change({ "doms": doms }, function (e) {
                //var rate = $(this).val();
                //video_dom[0].playbackRate=rate;
                rate_change($(doms.js_video));
                doms.dom_videoContainer.find('.setting_div').fadeOut();
            });
            /*
            * Animate controls
            * --------------------------------------- 
            */
            doms.dom_videoContainer.mouseenter(function () {
                showControls();
            });
            doms.dom_videoContainer.mouseleave(function () {
                //hideControls();          
            });
            doms.dom_videoContainer.mousemove(function () {
                viewContorls(3000);
            });
            /*
            * Fullscreen
            * --------------------------------------- 
        */
            doms.dom_videoContainer.find(".fullscreen").click(function () {
                if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                    // exit full-screen
                    doms.dom_videoContainer.find(".fullscreen").addClass('video-fullscreen-enter');
                    doms.dom_videoContainer.find(".fullscreen").removeClass('video-fullscreen-exit');
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                    //resize(default_opts.orin_width,default_opts.orin_height);

                } else if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) {
                    var i = doms.dom_videoContainer[0];

                    doms.dom_videoContainer.find(".fullscreen").removeClass('video-fullscreen-enter');
                    doms.dom_videoContainer.find(".fullscreen").addClass('video-fullscreen-exit');

                    // go full-screen
                    if (i.requestFullscreen) {
                        i.requestFullscreen();
                    } else if (i.webkitRequestFullscreen) {
                        i.webkitRequestFullscreen();
                    } else if (i.mozRequestFullScreen) {
                        i.mozRequestFullScreen();
                    } else if (i.msRequestFullscreen) {
                        i.msRequestFullscreen();
                    }

                    //resize($(window).width(),$(window).height());
                    //resize(0,0);

                    //resize($(window).width(),$(window).height());
                }
            });
            /*
            * Progress time
            * --------------------------------------- */
            setInterval(function () {
                videoCurrentTime = video_dom[0].currentTime;
                // Update HTML5 video current play time
                if (default_opts.merge == false) {
                    //Math.round(
                    doms.dom_videoContainer.find('.ctime').text(formatTime(videoCurrentTime));
                }
                else {
                    var ct = 0;
                    for (var i = 0; i < now_playIndex; i++) {
                        ct += parseFloat(sources[i]['duration']);
                    }
                    ct += videoCurrentTime;
                    //ct = Math.round(ct);
                    doms.dom_videoContainer.find('.ctime').text(formatTime(ct));
                }

                // Get HTML5 video time duration
                //doms.dom_videoContainer.find('.ttime').text(formatTime(videoDuration - Math.round(videoCurrentTime)));
                doms.dom_videoContainer.find('.ttime').text(formatTime(videoDuration));
            }, 500);
            doms.dom_scrubber = doms.dom_videoContainer.find(".progress_hover");
            doms.dom_progress = doms.dom_videoContainer.find(".progress-bar");

            //doms.dom_event_progress = doms.dom_videoContainer.find(".progress-event-bar");


            video_dom.bind("timeupdate", videoTimeUpdateHandler);
            //這裡就是按下 progress-bar
            doms.dom_scrubber.mousedown(scrubberMouseDownHandler);
            
            //可以拖移 progress-bar
            var isMouseDownToDragging = false;
            doms.dom_scrubber.bind("mousedown",function() {
                isMouseDownToDragging = true;
            }).mousemove(function(e) {
                if(isMouseDownToDragging){
                  scrubberMouseDownHandler(e);
                }
            }).mouseup(function() {
                isMouseDownToDragging = false;                
            });
            /*
            * Volume
            * --------------------------------------- 
            */

            doms.dom_videoContainer.find(".volume a").click({ "video_dom": video_dom }, function (e) {
                if (e.data.video_dom.prop('muted')) {
                    e.data.video_dom.prop('muted', false);
                    setVolume(savedVolume);
                } else {
                    e.data.video_dom.prop('muted', true);
                    savedVolume = e.data.video_dom[0].volume;
                    setVolume(0);
                }
            });


            /*
            * Airplay
            * --------------------------------------- */
            //改成 reqc='airplay'
            var airPlay = doms.dom_videoContainer.find("a[reqc='airplay']")[0];

            if (window.WebKitPlaybackTargetAvailabilityEvent) {
                doms.js_video.addEventListener('webkitplaybacktargetavailabilitychanged', function (event) {
                    switch (event.availability) {
                        case "available":
                            airPlay.style.display = 'block';
                            break;
                        default:
                            airPlay.style.display = 'none';
                    }
                    airPlay.addEventListener('click', function () {
                        doms.js_video.webkitShowPlaybackTargetPicker();
                    });
                });
            } else {
                airPlay.style.display = 'none';
            }
            $(document).on('keyup', { "video_dom": video_dom }, function (e) {
                //按到 ESC
                if (e.which == 32) {
                    var fullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
                    var isHovered = e.data.video_dom.data('isHovered');

                    if (fullScreen || isHovered) {
                        playVideo();
                        viewContorls(3000);
                    }
                }
            });
        }
        function videoTimeUpdateHandler(e) {
            //跳轉
            //var percent = doms.js_video.currentTime / doms.js_video.duration;
            var percent = 0;
            if (default_opts.merge == false) {
                percent = parseFloat(videoCurrentTime) / parseFloat(videoDuration);
            }
            else {
                var ct = 0;


                for (var i = 0; i < now_playIndex; i++) {
                    ct += parseFloat(sources[i]['duration']);
                    //console.log("sources[i]['duration']:"+sources[i]['duration']);            
                }
                ct += parseFloat(videoCurrentTime);
                percent = parseFloat(ct) / parseFloat(videoDuration);

                //console.log("videoTimeUpdateHandler ct:"+ct);
                //console.log("videoTimeUpdateHandler videoDuration:"+videoDuration);
                //console.log("videoTimeUpdateHandler percent:"+percent);
            }
            //console.log(percent);                                
            //updateProgressWidth(percent);
            switch (doms.dom_videoContainer.find(".play").text()) {
                case '❚❚':
                    doms.js_video.play();
                    rate_change($(doms.js_video));
                    break;
            }
            if (autoplayFixWidth) {
                updateProgressWidth(percent);
            }
        }

        function scrubberMouseDownHandler(e) {
            if (e.target.tagName !== 'VIDEO') {
                $(doms.js_video).attr('poster', '');
                e.preventDefault();
                //點到 時間 bar
                var $this = doms.dom_videoContainer.find(".progress");
                var x = e.pageX - $this.offset().left;
                var percent = x / $this.width();
                doms.js_video.pause();
                autoplayFixWidth = false;
                setTimeout(function () {
                    autoplayFixWidth = true;
                }, 500);
                //videoToCanvas();          
                updateVideoTime(percent);
            }
            e.stopPropagation();
        }
        function arduino_map(x, in_min, in_max, out_min, out_max) {
            //x = 輸入值
            //in 如 0~255
            //out 如 0~1024
            return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
        }
        function updateProgressWidth(percent) {
            if (allowBarChange) {
                doms.dom_progress.width((percent * 100) + "%");
                //doms.dom_event_progress.width((percent * 100) + "%");
            }
        }
        /*function videoToCanvas(){
          doms.ctx.drawImage(doms.js_video, 0, 0, doms.dom_videoContainer.find(".canvas")[0].width, doms.dom_videoContainer.find(".canvas")[0].height);
        }
        function canvasShowHide(bool){
          switch(bool)
          {
            case true:
              doms.dom_videoContainer.find(".canvas").css({'opacity':1});
              break;
            default:
              doms.dom_videoContainer.find(".canvas").css({'opacity':0});
              break;
          }
        }
        */
        function updateVideoTime(percent) {
            //doms.js_video.currentTime = percent * doms.js_video.duration;
            allowBarChange = false;
            doms.js_video.pause();
            //alert(percent);
            //alert(videoDuration);
            if (default_opts.merge == false) {
                allowBarChange = false;
                doms.js_video.currentTime = percent * videoDuration;
                switch (doms.dom_videoContainer.find(".play").text()) {
                    case '❚❚':
                        doms.js_video.play();
                        rate_change($(doms.js_video));
                        break;
                }
                allowBarChange = true;
                updateProgressWidth(percent);
            }
            else {

                var ct = percent * videoDuration;
                var sum = ct;
                var index = 0;
                //console.log("percent:"+percent);
                //console.log("videoDuration:"+videoDuration);
                //console.log("ct:"+ct);


                for (var i = 0, max_i = sources.length; i < max_i; i++) {
                    sum = sum - sources[i]['duration'];
                    if (sum >= 0) {
                        continue;
                    }
                    else {
                        index = i;
                        sum += sources[i]['duration'];
                        break;
                    }
                }
                /*doms.js_video.onloadeddata = function() {              
                  doms.js_video.currentTime = sum;
                }
                */
                if (index != now_playIndex) {
                    //canvasShowHide(false);               
                    doms.js_video.onloadstart = function () {
                        // https://stackoverflow.com/questions/14904623/detect-aspect-ratio-html5-video   
                        //default_opts.videoWidth = doms.js_video.videoWidth;
                        //default_opts.videoHeight = doms.js_video.videoHeight;
                        //get frame
                        //doms.js_video.currentTime( sum ).capture();

                        //console.log("sum:"+sum);
                        //alert(sum);
                        switch (doms.dom_videoContainer.find(".play").text()) {
                            case '❚❚':
                                doms.js_video.play();
                                rate_change($(doms.js_video));
                                doms.js_video.currentTime = sum;
                                //canvasShowHide(false);                 
                                break;
                            default:
                                //這樣才能真跳過畫面
                                doms.js_video.play();
                                rate_change($(doms.js_video));
                                doms.js_video.currentTime = sum;
                                doms.js_video.pause();
                                //setTimeout(function(){
                                //  canvasShowHide(false);                                    
                                //},500);
                                break;
                        }
                        allowBarChange = true;
                        updateProgressWidth(percent);
                    }
                    now_playIndex = index;
                    //console.log("now_playIndex:"+now_playIndex);
                    allowBarChange = false;
                    doms.js_video.pause();
                    doms.js_video.src = sources[now_playIndex]['url'];
                }
                else {
                    allowBarChange = false;
                    doms.js_video.currentTime = sum;
                    doms.js_video.pause();
                    doms.js_video.currentTime = sum;
                    switch (doms.dom_videoContainer.find(".play").text()) {
                        case '❚❚':
                            doms.js_video.play();
                            rate_change($(doms.js_video));
                            break;
                    }
                    allowBarChange = true;
                    updateProgressWidth(percent);
                }
            }

        }

        function formatTime(seconds) {
            minutes = Math.floor(seconds / 60);
            minutes = (minutes >= 10) ? minutes : "0" + minutes;
            seconds = Math.floor(seconds % 60);
            seconds = (seconds >= 10) ? seconds : "0" + seconds;
            return minutes + ":" + seconds;
        }
        function viewContorls(ms) {
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }

            showControls()
            doms.dom_videoContainer.find('.videoContainer').css('cursor', 'auto');
            timer = setTimeout(function () {
                hideControls();
                doms.dom_videoContainer.find('.videoContainer').css('cursor', 'none');
            }, ms)
        }
        function showControls() {
            doms.dom_videoContainer.find('.control').fadeIn(150);
        }
        function hideControls() {
            doms.dom_videoContainer.find('.control').fadeOut(150);
        }
        function setVolume($volume) {
            doms.js_video.volume = $volume / 100.0;
            var s = doms.dom_videoContainer.find(".volume-slider").val($volume);
            //console.log($volume);
            if ($volume == 0) {
                doms.dom_videoContainer.find(".toggle-sound").html(g.laba_off);
            }
            else {
                doms.dom_videoContainer.find(".toggle-sound").html(g.laba_on);
            }
        }
        function rate_change(video_dom) {
            var rate = doms.dom_videoContainer.find('.play_speed_select').val();
            video_dom[0].playbackRate = parseFloat(rate);
        }
        function playVideo() {
            if (doms.js_video.paused) {
                doms.js_video.play();
                rate_change($(doms.js_video));

                doms.dom_videoContainer.find(".play").text("❚❚");
                doms.dom_videoContainer.find(".play").removeClass("video-play");
                doms.dom_videoContainer.find(".play").addClass("video-pause");

            }
            else {
                doms.js_video.pause();
                doms.dom_videoContainer.find(".play").text("►");
                doms.dom_videoContainer.find(".play").addClass("video-play");
                doms.dom_videoContainer.find(".play").removeClass("video-pause");
            }
        }
        function load_videos(video_dom) {

            var sdom = video_dom.find("source");
            for (var i = 0, max_i = sdom.length; i < max_i; i++) {
                var d = new Object();
                d['url'] = sdom.eq(i).attr('src');

                if (sdom.eq(i).attr('req_duration') != null) {
                    d['duration'] = parseFloat(sdom.eq(i).attr('req_duration'));
                    videoDuration += d['duration'];
                }
                else {
                    d['duration'] = null;
                }

                if (sdom.eq(i).attr('req_events') != null) {
                    d['events'] = JSON.parse(atob(sdom.eq(i).attr('req_events')));
                }
                else {
                    d['events'] = null;
                }
                sources.push(d);
            }
            /*video_dom[0].onloadedmetadata = function(){                              
              videoDuration += video_dom[0].duration;          
              //console.log("GG:"+video_dom[0].duration);
              sources[0]['duration']=video_dom[0].duration;          
            };
            */
            video_dom.attr('src', sources[0]['url']);
            videoCurrentTime = video_dom[0].currentTime;
            //if(default_opts.merge)
            //{
            //2022-06-07 在此生成 events 操作
            var event_ct = 0;
            var ct = 0;
            for (var i = 0, max_i = sources.length; i < max_i; i++) {
                if (sources[i]["duration"] == null) {
                    var g = document.createElement("video");
                    $(g).attr('req_index', i);
                    g.onloadedmetadata = function () {
                        videoDuration += this.duration;
                        //console.log( $(this).attr('index') );
                        //console.log("GG_:"+this.duration);
                        var index = $(this).attr('req_index');
                        var duration = this.duration;
                        sources[index]['duration'] = duration;
                        this.remove();
                    };
                    g.style.display = "none";
                    g.src = sources[i]['url'];
                    document.body.appendChild(g);
                }
                else {

                    //console.log(default_opts);
                    //alert($.isArray(sources[i]["events"]));
                    if (default_opts.merge == true && default_opts.event == true && $.isArray(sources[i]["events"])) {
                        //console.log(sources[i]["events"]);
                        for (var j = 0, max_j = sources[i]["events"].length; j < max_j; j++) {
                            event_ct = ct + sources[i]["duration"] * sources[i]["events"][j]["event_percent"];
                            sources[i]["events"][j]["event_ct"] = event_ct;
                            //console.log("event_ct: "+event_ct);                
                        }
                        ct += sources[i]["duration"];
                    }
                }
            }

            //event 資料收集完成 轉成 dom 按鈕

            for (var i = 0, max_i = sources.length; i < max_i; i++) {
                if (default_opts.merge == true && default_opts.event == true && $.isArray(sources[i]["events"])) {
                    var $this = doms.dom_videoContainer.find(".progress");
                    var $this_event_bar = doms.dom_videoContainer.find(".progress-event-bar");
                    for (var j = 0, max_j = sources[i]["events"].length; j < max_j; j++) {
                        //換簡 event_ct 在 ct 的多少，然後換成成要 left 多少

                        //console.log($this.width());
                        var event_ct = sources[i]["events"][j]['event_ct'];
                        var dt = sources[i]["events"][j]['datetime'];
                        console.log(sources[i]["events"][j]);
                        var Left = arduino_map(event_ct, 0, ct, 0.0, parseFloat(100.0));
                        Left = Left.toFixed(2);
                        //console.log("event_ct:"+ event_ct+",ct:"+ct);
                        //console.log(Left); 
                        //放入 div
                        $this_event_bar.append("<div alt=\"" + dt + "\" title=\"" + dt + "\" style='z-index:1000;display:inline;width:3px;height:100%;background-color:orange;position:absolute;left:" + Left + "%;'></div>");

                    }
                }
            }
            $this_event_bar.find("div").mouseover(function (e) {
                console.log($(this).attr('title'));

            });
        }
        var run = function (video_dom) {
            init_ui(video_dom);
            init_events(video_dom);
            //start load first movie
            load_videos(video_dom);
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
        init(thIs, opts);
        return this;
    };
})(jQuery);