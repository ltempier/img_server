import React, {Component} from 'react';

import ImageRow from './ImageRow';

let storeImages = null;

class Upload extends Component {

    constructor(props) {
        super(props);
        this.state = {
            images: storeImages || []
        };

        this.fileUploadRef = React.createRef();

        this.onFileChange = this.onFileChange.bind(this);
        this.delete = this.delete.bind(this);
        this.upload = this.upload.bind(this);
        this.uploadAll = this.uploadAll.bind(this)
    }

    componentWillUnmount() {
        storeImages = this.state.images;
    }

    indexOf(imageId) {
        let idx = -1;
        this.state.images.some(function (image, i) {
            if (imageId === image.id) {
                idx = i;
                return true
            }
            return false
        });
        return idx
    }

    exist(imageId) {
        return (imageId && (this.indexOf(imageId) >= 0))
    }

    update(imageId, updImage, replace) {
        let idx = this.indexOf(imageId);
        if (idx < 0)
            return;

        this.setState((state) => {
            let images = [...state.images];
            if (replace === true)
                images[idx] = updImage;
            else
                images[idx] = {...images[idx], ...updImage};

            return {
                ...state,
                images
            }
        });
    }

    upload(imageId) {
        let idx = this.indexOf(imageId);
        if (idx < 0)
            return;

        this.update(imageId, {status: 'Uploading ...'});

        const image = this.state.images[idx];
        fetch(image.uri)
            .then(response => response.blob())
            .then((blob) => {
                let formData = new FormData();
                formData.append('image', blob, image.name);

                fetch('/images', {
                    method: 'POST',
                    body: formData
                }).then((response) => {
                    return response.json();
                }).then((response) => {
                    this.update(imageId, {status: 'Uploaded', isUploaded: true});
                    console.log('success', response);
                }).catch((error) => {
                    this.update(imageId, {status: 'error 2'});
                    console.log('error', error)
                });
            })
            .catch((error) => {
                this.update(imageId, {status: 'error 1'});
                console.log('error', error)
            });
    }

    uploadAll() {

        let formData = new FormData();
        let images = this.state.images;

        fillFormData()
            .then(() => {
                images.forEach((image) => {
                    this.update(image.id, {status: 'Uploading ALL ...'});
                });
                return Promise.resolve();
            })
            .then(() => {
                fetch('/images', {
                    method: 'POST',
                    body: formData
                }).then((response) => {
                    return response.json();
                }).then((response) => {
                    images.forEach((image) => {
                        this.update(image.id, {status: 'Uploaded ALL'});
                    });
                    console.log('success', response);
                }).catch((error) => {
                    console.log('error', error)
                });
            });

        async function fillFormData() {
            await Promise.all(images.map(async (image) => {
                await fetch(image.uri)
                    .then(response => response.blob())
                    .then((blob) => {
                        formData.append('image', blob, image.name);
                    })
            }));
        }
    }

    delete(imageId) {
        let idx = this.indexOf(imageId);
        if (idx < 0)
            return;

        this.setState((state) => {
            const images = [...state.images];
            images.splice(idx, 1);
            return {
                ...state,
                images
            }
        });
    }

    onFileChange(e) {

        // console.log('onFileChange', e.target)

        const length = (e && e.target && e.target.files && e.target.files.length) ? e.target.files.length : 0;
        for (let i = 0; i < length; i++) {
            const image = e.target.files[i];
            const imageId = [image.lastModified, image.size, image.name].join('_');
            if (this.exist(imageId)) {
                console.log('file already in list', image.name)
            } else {
                // console.log('add file', image.name, this.state.images, url:,URL.createObjectURL(image))
                this.setState((state) => {
                    return {
                        ...state,
                        images: [...state.images, {
                            id: imageId,
                            name: image.name,
                            size: image.size,
                            type: image.type,
                            lastModified: image.lastModified,
                            lastModifiedDate: image.lastModifiedDate,
                            uri: URL.createObjectURL(image)
                        }]
                    }
                })
            }
        }
    }

    render() {

        return (

            <div className="container mt-5">

                <div id="files" className="col-12">
                    {
                        this.state.images.map((image, key) => {
                            return (
                                <ImageRow {...image}
                                          src={image.uri}
                                          key={key}

                                          onDeleteClick={() => this.delete(image.id)}
                                          onUploadClick={() => this.upload(image.id)}
                                >
                                </ImageRow>
                            )
                        })
                    }
                </div>

                <div className="text-muted mt-5">
                    <button className="btn btn-primary"
                            onClick={() => this.fileUploadRef.current.click()}>Add +
                    </button>
                    <input ref={this.fileUploadRef}
                           className="invisible"
                           type="file" multiple
                           onChange={this.onFileChange}/>

                    <button className="btn btn-outline-primary float-right"
                            onClick={this.uploadAll}>Upload
                    </button>
                </div>

            </div>
        );
    }
}

export default Upload;
