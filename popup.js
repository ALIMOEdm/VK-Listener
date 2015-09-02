function setPort(callback){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        try{
            var port = chrome.tabs.connect(tabs[0].id, {name: 'TEST'});
            console.log('active tab');
            if(callback){
                callback(port);
            }
        }catch(e){
            console.error(e);
        }
    });
}

function sendMessage(data){
    var request = {
        type: 'VKDATA'
    };
    if(data){
        request = data;
    }
    console.log('sendMessage');
    setPort(function(port){
        if(port) {
            console.log('setPort callback');
            port.postMessage(request);
        }
    });
}
var authTabId;
$('#vk_api_transport').on('click', function(){
    var auth_url = 'https://oauth.vk.com/authorize?client_id=5044133&display=page&redirect_uri=http%3A%2F%2Foauth.vk.com%2Fblank.html&scope=friends&response_type=token&v=5.37';
    chrome.tabs.create({url: auth_url,selected: true}, function(tab) {
        authTabId = tab.id;
    });
});

chrome.extension.onMessage.addListener(function(request){
    
    switch(request.type){
        case "VK_AUTHORIZATION":
            var hash = request.hash;
            var hash_arr = hash.split('&');
            var access_token = '';
            var user_id = '';
            for(var i = 0; i < hash_arr.length; i++){
                if(hash_arr[i].indexOf('access_token') > -1){
                    var s = hash_arr[i].split('=');
                    access_token = s[1];
                }else if(hash_arr[i].indexOf('user_id') > -1){
                    var s = hash_arr[i].split('=');
                    user_id = s[1];
                }
            }
            jQuery('#access_token').val(access_token);
            jQuery('#user_id').val(user_id);
            
            if(access_token && user_id){
            
                current_vk_user.setAccessToken(access_token);
                current_vk_user.setUserId(user_id);
                current_vk_user.saveDada();
            }
            break;
    }
    
});

$(document).ready(function(){
    if(current_vk_user.getAccessToken()){
        $('#access_token').val(current_vk_user.getAccessToken());
    }
    if(current_vk_user.getAccessToken()){
        $('#user_id').val(current_vk_user.getUserId());
    }
});

//
chrome.tabs.onUpdated.addListener(function tabUpdateListener(tabId, changeInfo) {
    if ( changeInfo.url != undefined && changeInfo.status == "loading") {
        sendMessage();
    }
});

var current_vk_user = new VkUser();
current_vk_user.restorData();

$(document).on('submit', '[name="vk-form"]', function(event){
    event.preventDefault();
    var acc_token_el = $('#access_token');
    var user_id_el = $('#user_id');
    var acc_token = $(acc_token_el).val();
    var user_id = $(user_id_el).val();

    $(acc_token_el).val('');
    $(user_id_el).val('');

    current_vk_user.setAccessToken(acc_token);
    current_vk_user.setUserId(user_id);
    current_vk_user.saveDada();
});

$(document).on('click', '.btn-get-frinends', function(event){
    var user_id = current_vk_user.getUserId();
    if(!user_id){
        alert('Вы должны авторизировать в вк');
        return;
    }

    $.ajax({
        url:'https://api.vk.com/method/friends.get?user_id='+user_id+'&v=5.37&fields=city&name_case=nom&order=hints',
        type:'get',
        success: function(data){
            if(data.response && data.response.count){
                var list = current_vk_user.getFriends();
                var ids = [];
                for(var i = 0, n = list.length; i < n; i++){
                    ids.push(parseInt(list[i].getUserId()));
                }

                //console.log(ids);

                var items = data.response.items;
                var str = '<ul class="friend-list">';
                str += '<li><div class="checkbox"><label><input data-role="all" type="checkbox">All</label></div></li>'
                var checked = '';
                for( i = 0, n = items.length; i < n; i++){
                    //console.log(ids, items[i].id);
                    if(_.indexOf(ids, items[i].id) !== -1){
                        checked = 'checked';
                    }else{
                        checked = '';
                    }
                    str += '<li><div class="checkbox"><label><input '+checked+' data-f_name="'+items[i].first_name+'" data-l_name="'+items[i].last_name+'" data-fio="'+items[i].last_name+' '+items[i].first_name+'" data-role="friends-list" type="checkbox" value="'+items[i].id+'">'+items[i].last_name+' '+items[i].first_name;
                    str += '</label></div></li>';
                }
                str += '</ul>';

                $('#friend_list').html(str);
                str = null;
            }
        }
    });
});

$(document).on('change', '[data-role="all"]', function(event){
    var src = event.target;
    var parent_ul = $(src).parents('.friend-list');
    if($(src).prop('checked')){
        $(parent_ul).find('[type=checkbox]').prop('checked', 'checked');
    }else{
        $(parent_ul).find('[type=checkbox]').prop('checked', false);
    }
})

$(document).on('click', '.btn-save-friends', function(event){
    var btn = event.target;
    var list = $(btn).parents('#vk-friend-list').find('[data-role="friends-list"]:checked');
    if(list.length){
        getFriendsOnline(function(online_fr){
            current_vk_user.clearFriendList();
            $.each(list, function(index, value){
                var friend = new VkUser();
                friend.setUserId($(value).val());
                friend.setFirstName($(value).data('f_name'));
                friend.setLastName($(value).data('l_name'));
                //console.log(_.indexOf(online_fr, parseInt(friend.getUserId())), parseInt(friend.getUserId()));
                if(_.indexOf(online_fr, parseInt(friend.getUserId())) !== -1){
                    //console.log(1);
                    friend.setStatusOnline(1);
                }else{
                    friend.setStatusOnline(0);
                }
                current_vk_user.addFriend(friend);
                current_vk_user.saveDada();
            });
        });
    }
});


function getFriendsOnline(action){
    var user_id = current_vk_user.getUserId();
    var access_token = current_vk_user.getAccessToken();

    if(!user_id || !access_token){
        alert('Вы должны авторизировать в вк');
        return;
    }
    $.ajax({
        url:'https://api.vk.com/method/friends.getOnline?user_id='+user_id+'&v=5.37&access_token='+access_token+'&online_mobile=1',
        type:'get',
        success: function(data){
            //console.log(data);
            if(data.response && (data.response.online || data.response.online_mobile )){
                var union = _.union(data.response.online, data.response.online_mobile);
                action(union);
            }
        }
    });
}

chrome.alarms.onAlarm.addListener(function( alarm ) {
//обмен сообщениями
//http://habrahabr.ru/post/174745/
    if(alarm.name == 'remindme') {
        updateFriendStatus();
        getAnotherUsersOnline();
    }
});



function updateFriendStatus(){
    if (!current_vk_user.getUserId() || !current_vk_user.getAccessToken()) {
        console.info('you must be autorizate into VK');
        return;
    }
    
    console.log('check online');

    getFriendsOnline(function (online_fr) {
        var list = current_vk_user.getFriends();
        current_vk_user.clearFriendList();
        $.each(list, function (index, value) {
            if (_.indexOf(online_fr, value.getUserId()) !== -1) {
                if (!value.getStatusOnline()) {
                    var ob = {
                        text: 'User '+value.getFio() + ' is online',
                        type: 'VK_NOTIFICATION',
                        error: 0
                    };
                    sendMessage(ob);
                    console.info('User '+value.getFio() + ' is online');
                }
                value.setStatusOnline(1);
            } else {
                if (value.getStatusOnline()) {
                    var ob = {
                        text: 'User ' + value.getFio() + ' is offline',
                        type: 'VK_NOTIFICATION',
                        error: 0
                    };
                    sendMessage(ob);
//                    chrome.extension.sendMessage(ob);
                    console.info('User '+value.getFio() + ' is offline');
                }
                value.setStatusOnline(0);
            }
            current_vk_user.addFriend(value);
            current_vk_user.saveDada();
        });
    });
    
    
}

document.addEventListener("DOMContentLoaded", function(){
    current_vk_user.restorData();
    if(!current_vk_user.getUserId() || !current_vk_user.getAccessToken()){
        $('#vk_data_form_wrapper').show();
    }else{
        $('#vk_data_form_wrapper').hide();
    }
});

$(document).on('click', '.btn-clear-data', function(event){
    if(!confirm('Are You sure?')){
        return;
    }
    current_vk_user.remove();
    $('#vk_data_form_wrapper').show();
});
chrome.tabs.insertCSS(null, {file: "lib/jquery.jgrowl.min.css"})
chrome.tabs.executeScript(null, {file: "jquery2.js"});
chrome.tabs.executeScript(null, {file: "lib/jquery.jgrowl.min.js"});
chrome.tabs.executeScript(null, {file: "myscript.js"});

$(document).on('submit', '[name="vk-another-idform"]', function(event){
    event.preventDefault();
    var form = event.target;
    var identificator = $(form).find('#another_user_id').val();
    $.ajax({
        url:'https://api.vk.com/method/users.get?user_ids='+identificator+'&v=5.37&name_case=Nom&fields=online',
        type:'get',
        success: function(data){
            //console.log(data);
            if(data.response){
                for(var i = 0; i < data.response.length; i++){
                    var info = data.response[i];
                    if(!current_vk_user.conteinsAnotherUsers(info.id)){
                        var user = new VkUser();
                        user.setUserId(info.id);
                        user.setFirstName(info.first_name);
                        user.setLastName(info.last_name);
                        user.setStatusOnline(parseInt(info.online));
                        current_vk_user.addAnotherUser(user);
                        current_vk_user.saveDada();
                    }
                }
                $(form).find('#another_user_id').val('');
            }
        }
    });
});

function getAnotherUsersOnline(action){
    var arr = current_vk_user.getAnotherUsersIds();
    var id_str = arr.join(',');
    $.ajax({
        url:'https://api.vk.com/method/users.get?user_ids='+id_str+'&v=5.37&name_case=Nom&fields=online',
        type:'get',
        success: function(data){
            if(data.response){
                current_vk_user.indexingAnotherUser();
                for(var i = 0; i < data.response.length; i++){
                    var info = data.response[i];
                    console.log(info);
                    var ob = {
                        id: info.id,
                        first_name: info.first_name,
                        last_name: info.last_name,
                        online: info.online
                    }
                    if(current_vk_user.updateAnotherUser(ob)){
                        if(info.online){
                            var ob = {
                                text: 'User ' + ob.last_name + ' ' + ob.first_name + ' is online now',
                                type: 'VK_NOTIFICATION',
                                error: 0
                            };
                        }else{
                            var ob = {
                                text: 'User ' + ob.last_name + ' ' + ob.first_name + ' is offline now',
                                type: 'VK_NOTIFICATION',
                                error: 0
                            };
                        }
                        sendMessage(ob);
                        console.info('User ' + ob.last_name + ' ' + ob.first_name + ' is offline now');
                    }
                    current_vk_user.saveDada();
                }
            }
        }
    });
}