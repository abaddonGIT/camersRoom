/**
 * Created by abaddon on 11.09.14.
 */
/*global window, document, angular, MediaStreamTrack, console, navigator */
(function (w, d, an, mst, nav) {
    "use strict";
    angular.module("camersRoom", []).
        value("$sectors", {}).
        directive("ngVideoSector", ['$sectors', function ($sectors) {
            return {
                restrict: "A",
                link: function (scope, elem, attr) {
                    $sectors[attr.ngVideoSector] = elem;
                }
            };
        }]).
        directive("ngRoomPlace", ["$room", "$sectors", "$compile", function ($room, $sectors, $compile) {
            return {
                restrict: "A",
                controller: function ($scope, $element) {
                    this.createViews = function (html) {
                        var videoBlock = $sectors.rec, content;
                        videoBlock.append(html);
                        content = videoBlock.contents();
                        $compile(content)($scope);
                    };
                },
                link: function (scope, elem, attr, cont) {
                    if ($room.support) {
                        var mediaSources = [], html, count;
                        $room.getMediaSources().then(function (sources) {
                            an.forEach(sources, function (val, key) {
                                if (sources[key].kind === 'video') {/*find only video devices. Отбираем только видео устройства*/
                                    mediaSources.push(val);
                                }
                            });
                            count = mediaSources.length;
                            if (count) {
                                html = $room.createSourcePreview(mediaSources);
                                cont.createViews(html);
                            } else {
                                scope.error = {
                                    show: true,
                                    text: "Ну для работы надо хоть одну камеру подключить!"
                                };
                            }
                            /*create video block views.*/
                        });
                    } else {
                        scope.error = {
                            show: true,
                            text: "Очень жаль, но ваш браузер никуда не годится. Откройте Google Chrome"
                        };
                    }
                }
            };
        }]).
        factory("$room", ["$q", "$sectors", function ($q, $sectors) {
            var Room = function () {
                var methods = {
                    get support() {
                        return !!this.media;
                    },
                    set support(value) {
                        this.media = value;
                    }
                };
                an.extend(this, methods);
                this.support = mst.getSources;
            };
            Room.prototype = {
                _createVideoElement: function (stream) {
                    var video = d.createElement("video");
                    video.src = w.URL.createObjectURL(stream);
                    video.controls = true;
                    video.play();
                    $sectors.place.append(video);
                },
                getMediaSources: function () {/*get all media sources. Получение всех медиа аудио, видео устройств*/
                    var defer = $q.defer();
                    mst.getSources(function (sources) {
                        defer.resolve(sources);
                    });
                    return defer.promise;
                },
                createSourcePreview: function (mediaSources) {
                    var htmlString = '', i = 0;
                    an.forEach(mediaSources, function (val) {
                        i++;
                        htmlString += '<button class="video-preview" ng-click="startBroadcast($event)" id="' + val.id + '">Камера ' + i + '</button>';
                    });
                    return htmlString;
                },
                addVideoPlace: function (sourceid) {
                    var constraints = {};
                    constraints.video = {
                        mandatory: {
                            minWidth: 640,
                            minHeight: 480,
                            minFrameRate: 30
                        },
                        optional: [
                            { sourceId: sourceid }
                        ]
                    };
                    nav.webkitGetUserMedia(constraints, function (stream) {
                        this._createVideoElement(stream);
                    }.bind(this), function (e) {
                        alert("Ошибка при получении потока с камеры!");
                    });
                }
            };
            return new Room();
        }]);
}(window, document, angular, MediaStreamTrack, navigator));