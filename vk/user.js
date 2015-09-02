function VkUser(ob){
    this.access_token = (ob && ob.access_token) ? ob.access_token : null;
    this.user_id = (ob && ob.user_id) ? ob.user_id : null;
    this.id = (ob && ob.id) ? ob.id : null;
    this.first_name = (ob && ob.first_name) ? ob.first_name : null;
    this.last_name = (ob && ob.last_name) ? ob.last_name : null;
    this.status_online = (ob && ob.status_online) ? ob.status_online : null;
    this.base = 'vk_auth_tester';
    //this.base_friends = 'vk_friend_list';
    this.friends_list = [];
    this.another_users = [];
    this.index_arr_another_user = {};//для индексации и ускорения поиска по ид в массиве
}

VkUser.prototype.setAccessToken = function(token){
    this.access_token = token;
};

VkUser.prototype.getAccessToken = function(){
    return this.access_token;
};

VkUser.prototype.setUserId = function(user_id){
    this.user_id = user_id;
};

VkUser.prototype.getUserId = function(){
    return parseInt(this.user_id);
};

VkUser.prototype.addFriend = function(friend_object){
    this.friends_list.push(friend_object);
};

VkUser.prototype.addAnotherUser = function(user_object){
    this.another_users.push(user_object);
};

VkUser.prototype.getFriends = function(){
    return this.friends_list;
}

VkUser.prototype.getAnotherUsers = function(){
    return this.another_users;
}

VkUser.prototype.conteinsAnotherUsers = function(user_id){
    for(var i = 0, n = this.another_users.length; i < n; i++){
        if(this.another_users[i].user_id == user_id){
            return true;
        }
    }
    return false;
};

VkUser.prototype.getAnotherUsersIds = function(){
    var res = [];
    for(var i = 0, n = this.another_users.length; i < n; i++){
        res.push(this.another_users[i].user_id);
    }
    return res;
};

VkUser.prototype.indexingAnotherUser = function(){
    for(var i = 0, n = this.another_users.length; i < n; i++){
        this.index_arr_another_user[this.another_users[i].user_id] = {
            'index' : i
        };
    }
}
VkUser.prototype.updateAnotherUser = function(ob){
    var user_id = ob.id;
    var index = this.index_arr_another_user[user_id];
    var index_val = index.index;
    this.another_users[index_val].setFirstName(ob.first_name);
    this.another_users[index_val].setLastName(ob.last_name);
    if(parseInt(this.another_users[index_val].getStatusOnline()) == parseInt(ob.online)){
        return false;
    }
    this.another_users[index_val].setStatusOnline(ob.online);
    return true;
}


VkUser.prototype.setFirstName = function(f_name){
    this.first_name = f_name;
};

VkUser.prototype.setLastName = function(l_name){
    this.last_name = l_name;
};

VkUser.prototype.getFio = function(){
    return this.last_name + ' ' + this.first_name;
};

VkUser.prototype.setStatusOnline = function(st){
    this.status_online = st;
};

VkUser.prototype.getStatusOnline = function(){
    return this.status_online;
};

VkUser.prototype.clearFriendList = function(){
    this.friends_list = null;
    this.friends_list = [];
};

VkUser.prototype.clearAnotherUsersList = function(){
    this.another_users = null;
    this.another_users = [];
};

VkUser.prototype.saveDada = function(){
    var json_str = JSON.stringify(this);
    localStorage.setItem(this.base, json_str);
};

VkUser.prototype.restorData = function(){
    var user_str = localStorage.getItem(this.base);
    if(!user_str){
        return;
    }
    var user_ob = JSON.parse(user_str);
    for(var prop in user_ob ){
        if(user_ob.hasOwnProperty(prop)){
            if(prop == 'friends_list' || prop == 'another_users'){
                if(prop == 'another_users'){
                    console.log(prop, user_ob[prop]);
                }
                for(var i = 0; i < user_ob[prop].length; i++){
                    user_ob[prop][i] = new VkUser(user_ob[prop][i]);
                }
            }
            this[prop] = user_ob[prop];
        }
    }
};
VkUser.prototype.remove = function(){
    localStorage.removeItem(this.base);
    this.restorData();
}