function Model(){
    this.name = '';
}
Model.prototype.set = function(key, value){
    var dict = localStorage.getItem(this.name);
    ob = {
        key: key,
        value: value
    };
    if(!dict){
        dict = [];
        dict.push(ob);
    }else{
        dict = JSON.parse(dict);
        var isExists = false;
        for(var i = 0, n = dict.length; i < n; i++){
            if(dict[i]['key'] == key){
                dict[i]['value'] = value;
                isExists = true;
                break;
            }
        }
        if(!isExists) {
            dict.push(ob);
        }
    }
    localStorage.setItem(this.name, JSON.stringify(dict));
};

Model.prototype.update = function(key, value, index){
    var dictionary = this.getAll();
    if(index){
        dictionary[index].value = value;
    }else{
        for(var i = 0, n = dictionary.length; i < n; i++){
            if(dictionary[i].key == key){
                dictionary[i].value = value;
                break;
            }
        }
    }
    
    localStorage.setItem(this.name, JSON.stringify(dictionary));
}

Model.prototype.get = function(key){
    var dictionary = this.getAll();
    for(var i = 0, n = dictionary.length; i < n; i++){
        if(dictionary[i].key == key){
            return {
                value: dictionary[i].value,
                index: i
            };
        }
    }
    return false;
};

Model.prototype.getAll = function(){
    var dict = localStorage.getItem(this.name);
    if(!dict){
        return [];
    }
    dict = JSON.parse(dict);
    return dict;
};

Model.prototype.setName = function(name){
    this.name = name;
};

Model.prototype.contans = function(key){
    var dictionary = this.getAll();
    
    for(var i = 0, n = dictionary.length; i < n; i++){
        if(dictionary[i].key == key){
            return true;
        }
    }
    return false;
}