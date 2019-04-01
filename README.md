
## deploy

#### docker

```
npm run docker-build
npm run docker-run
```

#### docker-compose
```
docker-compose up -d img_server
```

## server API

##### POST /images

- description: upload image file on server
- body:
```
FormData: {
   image: Blob,
   sizes: [2000] (list of desired resize in kb)
}
```

#####  GET /images
- description: list images on server
- query:
```
{
    sortBy: string ["timestamp"] (default "timestamp"),
    sort: string ["asc","desc"] (default "desc"),
    limit: number (default 0),
    from: number (default 0)
}
```
- result:
```
[
    {
        hash: "123456789",
        originalName: "filename.jpg",
        originalUrl: "/images/123456789",
        files: [
            {
                name: "2000kb_filename.jpg",
                size: 1992796,
                id: "2000kb",
                url: "/images/123456789/2000kb"
            },
            {
                name: "filename.jpg",
                size: 5732547,
                id: "original",
                url: "/images/123456789/original"
            }
        ]
    },
    {...}
]
```

#####  GET  /images/{hash}

- description: download original file (if exist)

#####  GET  /images/{hash}/{size}

- description: download file with specified size (if exist)


## client

#####  upload screen 

- description: upload form

- screenshot: 
![upload screenshot](https://raw.githubusercontent.com/ltempier/img_server/master/screenshot/upload_31-03-2019.png)


#####  browse screen 

- description: list images from server

- screenshot: 
![browse screenshot](https://raw.githubusercontent.com/ltempier/img_server/master/screenshot/browse_31-03-2019.png)

