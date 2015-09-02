(function () {
    'use strict';
    var alarmName = 'remindme';
    
    function checkAlarm(callback) {
        chrome.alarms.getAll(function(alarms) {
            var hasAlarm = alarms.some(function(a) {
                return a.name == alarmName;
            });
            var newLabel;
            if (hasAlarm) {
                newLabel = 'Cancel notifications';
            } else {
                newLabel = 'Activate notifications';
            }
            $('#toggleAlarm').text(newLabel);
            if (callback) callback(hasAlarm);
        });
//            var hasAlarm = window.interval ? true : false;
//            var newLabel;
//            if (hasAlarm) {
//                newLabel = 'Cancel notifications';
//            } else {
//                newLabel = 'Activate notifications';
//            }
//            $('#toggleAlarm').text(newLabel);
//            if (callback) callback(hasAlarm);
    }
    function createAlarm() {
        chrome.alarms.create(alarmName, {
            delayInMinutes: 0.1, periodInMinutes: 0.1});
//        window.interval = setInterval(function(){
//            updateFriendStatus();
//        }, 5000);
//        localStorage.setItem('vk_listener_notify', {'notify' : 'yes'})
    }
    function cancelAlarm() {
        chrome.alarms.clear(alarmName);
//        if(window.interval){
//            clearInterval(window.interval);
//        }
    }
    function doToggleAlarm() {
        checkAlarm( function(hasAlarm) {
            if (hasAlarm) {
                cancelAlarm();
            } else {
                createAlarm();
            }
            checkAlarm();
        });
    }
    $('#toggleAlarm').on('click', doToggleAlarm);
    //cancelAlarm();
    checkAlarm();
})();