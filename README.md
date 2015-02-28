# TringTrong
TringTrong is small node based SOA for getting and setting data. It saves geo data in mongodb async and sync way

##Clustered

It is right now equal to number of CPUs, we will have configuration in future :)

##Set Data
http://localhost:3000/set/someid?async=false or http://localhost:3000/set/someid?async=true


Right now ID is not unique, it can be used to track movement of a user

async parameter is either true or false, invalid is consider as true. If true is given, it will return an empty set right now


##Get Data
http://localhost:3000/get/someid


###ToDo
- CPUs number configuration