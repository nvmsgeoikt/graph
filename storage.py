#!/usr/bin/env python
# -*- coding: utf-8 -*-
import shelve
import uuid
import json

class Item():

    def decode(self, dict):
        if dict['id']:
            self.id = str(dict['id'])
        else:
            self.id = str(uuid.uuid4())
        self.deps = dict['deps']
        self.text = dict['text']
        self.progress = dict['progress']
        return self

    def __init__(self):
        self.id = str(uuid.uuid4())
        self.deps = ''
        self.text = ''
        self.progress = 0

class Storage():

    def write(self, jsontext):
        dict = json.loads(jsontext)
        item = Item().decode(dict)
        self.datafile[item.id] = item
        return item

    def read(self, id=None):
        if id:
            #Get one item
            item = None
            try:
                item = self.datafile[str(id)]
            except:
                print('Unable to find item with id:' + id)
            if item:
                return json.dumps(item.__dict__)
        else:
            #Get all items
            items = []
            for item_id in self.datafile.keys():
                items.append(self.read(item_id))
            return '[' + ','.join(items) + ']'

    def __init__(self):
        self.datafile = shelve.open('datafile', writeback = True)


#USAGE:
store = Storage()

def read_item(item_id):
    print('Trying to read item')
    item_as_json = store.read(item_id)
    if not item_as_json:
        print('Item not written yet')
    else:
        print('Item found')
        print(item_as_json)

if __name__ == "__main__":
    i = Item()
    i.progess = 23
    read_item(i.id)
    store.write(json.dumps(i.__dict__))
    read_item(i.id)
