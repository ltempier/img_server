# description

I developed this project because I wanted to share heavy pictures (>5Mb) on my travel blog.

img_server allows to upload and resize pictures at a convenient size for a website via an HTTP API.
Also I developed an interface to manage all the uploaded files.

TODO:
- eject react to have one project (1 package.json ...)
- auth for upload and delete
- better design
- group images (albums)

# env

- node > v8
- imagemagick 

# deploy

```
docker-compose up -d img_server
```
> show Dockerfile for deploy instructions

# server API

#### POST /images

- description: upload image file on server and resize image
- body:
```
FormData: {
   image: Blob,
   sizes: [2000] (list of desired resize in kb)
}
```

####  GET /images
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

####  GET  /images/{hash}

- description: download original image file specified by hash (if exist)

####  GET  /images/{hash}/{size}

- description: download image file specified by hash and size (if exist)

####  DELETE  /images/{hash}/{size}

- description: delete image file specified by hash and size


# client

####  upload screen 

- description: upload form

- screenshot: 
![upload screenshot](https://raw.githubusercontent.com/ltempier/img_server/master/screenshot/upload_31-03-2019.png)


####  browse screen 

- description: list images from server

- screenshot: 
![browse screenshot](https://raw.githubusercontent.com/ltempier/img_server/master/screenshot/browse_31-03-2019.png)

