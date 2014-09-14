/**
 * Created by abaddon on 11.09.14.
 */
/*global window, document, angular, console */
var app = angular.module("camsRoom", ['camersRoom']).
    controller("baseController", ["$scope", "$room", function ($scope, $room) {
        "use strict";
        $scope.startBroadcast = function (e) {
            var target = e.target;
            $room.addVideoPlace(target.id);
        };
    }]);