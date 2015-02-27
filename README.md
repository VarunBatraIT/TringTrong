# TringTrong
TringTrong is small node based SOA for getting and setting data. It saves geo data in mongodb async and sync way

##Set Data
http://localhost:3000/set/someid?async=false
http://localhost:3000/set/someid?async=true
Right now ID is not unique, it can be used to track movement of a user

async parameter is either true or false, invalid is consider as true. If true is given, it will return an empty set right now


##Get Data
http://localhost:3000/get/someid


###ToDo
Some standard structuring will be required to return same type of structure everytime
