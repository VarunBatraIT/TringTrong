# TringTrong
TringTrong is small node based SOA for getting and setting data. It saves geo data in mongodb async and sync way

##Clustered

By default it is equal to number of CPUs otherwise you can pass argument with -c like following:

```
node app.js -c 2
```

##Set Data

For sync data (returns data immediately)

```
http://localhost:3000/set/user-007?async=false
```


```
{"id":"user-007","data":{"range":[2057400832,2057401087],"country":"IN","region":"07","city":"Delhi","ll":[28.6667,77.2167],"metro":0}}
```


For async data, which returns an empty set while trying to figure out location behind the scene



```
http://localhost:3000/set/user-007?async=true
```


```
http://localhost:3000/set/user-007
```


```
{}
```


Right now ID is not unique, it can be used to track movement of a user

async parameter is either true or false, invalid is consider as true. If true is given, it will return an empty set right now


##Get Data
http://localhost:3000/get/user-007




```
[{"id":"user-007","data":{"geo":{"metro":0,"ll":[28.6667,77.2167],"city":"Delhi","region":"07","country":"IN","range":[2057400832,2057401087]}}},{"id":"user-007","data":{"geo":{"metro":0,"ll":[28.6667,77.2167],"city":"Delhi","region":"07","country":"IN","range":[2057400832,2057401087]}}},{"id":"user-007","data":{"geo":{"metro":0,"ll":[28.6667,77.2167],"city":"Delhi","region":"07","country":"IN","range":[2057400832,2057401087]}}}]
```

