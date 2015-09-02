function Dictionary(storage, name){
    this.name =  name || 'custom_dictionary';
    this.storage = storage;
    this.storage.setName(this.name);
    this.onChangeF = null;
}

Dictionary.prototype.addWord = function(word, translate){
    this.storage.set(word, translate);
    if(this.onChangeF) {
        this.onChangeF(this);
    }
};

Dictionary.prototype.update = function(key, value, index){
    this.storage.update(key, value, index);
}

Dictionary.prototype.getTranslate = function(word){
    return this.storage.get(word);
};

Dictionary.prototype.getDictionary = function(){
    return this.storage.getAll();
};

Dictionary.prototype.onChange = function(action){
    this.onChangeF = action;
};

Dictionary.prototype.contains = function(key){
    return this.storage.contans();
}