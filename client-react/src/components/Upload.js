import React, {Component} from 'react';

import ImageRow from './ImageRow';

let savedState = null;

class Upload extends Component {

    constructor(props) {
        super(props);
        this.state = savedState || {
            images: [],
            sizes: [2000]
        };

        this.fileUploadRef = React.createRef();
        this.inputSizeRef = React.createRef();

        this.onFileChange = this.onFileChange.bind(this);
        this.delete = this.delete.bind(this);
        this.upload = this.upload.bind(this);
        this.uploadAll = this.uploadAll.bind(this);
        this.addSize = this.addSize.bind(this);
        this.removeSize = this.removeSize.bind(this)
    }

    componentWillUnmount() {
        savedState = this.state;
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
            return Promise.reject(`image not found, image.id: ${imageId}`);

        return this.setState((state) => {
            let images = [...state.images];
            if (replace === true)
                images[idx] = updImage;
            else
                images[idx] = {
                    ...images[idx],
                    ...updImage
                };

            return {
                ...state,
                images
            }
        });
    }

    upload(imageId) {
        return new Promise((resolve, reject) => {

            let idx = this.indexOf(imageId);
            if (idx < 0)
                return resolve();

            this.update(imageId, {
                status: 'Uploading ...',
                hideUploadBtn: true,
                hideRemoveBtn: true,
                hideDownloadDiv: false
            });

            const image = this.state.images[idx];
            fetch(image.uri)
                .then(response => response.blob())
                .then((blob) => {
                    let formData = new FormData();
                    formData.append('image', blob, image.name);

                    const url = '/images?sizes=' + encodeURIComponent(this.state.sizes.join(','));
                    fetch(url, {
                        method: 'POST',
                        body: formData
                    }).then((response) => {
                        return response.json();
                    }).then((response) => {
                        console.log('success', response);
                        return this.update(imageId, {
                            ...response[0],
                            status: 'Uploaded',
                            hideUploadBtn: true,
                            hideRemoveBtn: false
                        });
                    }).then((response) => {
                        resolve(response)
                    }).catch((error) => {
                        this.update(imageId, {
                            status: 'error 2',
                            hideUploadBtn: false,
                            hideRemoveBtn: false
                        });
                        console.log('error 2', error);
                        reject(error)
                    });
                })
                .catch((error) => {
                    this.update(imageId, {
                        status: 'error 1',
                        hideUploadBtn: false,
                        hideRemoveBtn: false
                    });
                    console.log('error 1', error);
                    reject(error)
                });
        })


    }

    uploadAll() {
        this.state.images.reduce(async (previousPromise, image) => {
            await previousPromise;
            return this.upload(image.id);
        }, Promise.resolve());
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
                        images: [{
                            id: imageId,
                            name: image.name,
                            size: image.size,
                            uri: URL.createObjectURL(image),
                            status: 'not processed',
                            hideDownloadDiv: true
                        }, ...state.images]
                    }
                })
            }
        }
    }

    addSize() {
        try {
            const newSize = parseInt(this.inputSizeRef.current.value);
            if (this.state.sizes.indexOf(newSize) < 0 && newSize > 0) {
                this.setState((state) => {
                    return {
                        ...state,
                        sizes: [
                            ...state.sizes,
                            newSize
                        ]
                    }
                });

                this.state.images.forEach((image) => {
                    if (image.files) {
                        let canUpload = image.files.some((file) => {
                            return file.id === newSize + 'kb'
                        });
                        if (!canUpload)
                            this.update(image.id, {hideUploadBtn: false})
                    }
                })
            }


        } catch (e) {

        }
    }

    removeSize(index) {
        const sizes = this.state.sizes.splice(index, 1);
        this.setState(sizes)
    }

    render() {

        return (

            <div className="container mt-3">
                <div className="card mb-3">
                    <div className="card-body">

                        <div className="row">

                            <div className="col-2">
                                <button className="btn btn-primary"
                                        onClick={() => this.fileUploadRef.current.click()}>+ Add File
                                </button>

                                <input ref={this.fileUploadRef}
                                       hidden={true}
                                       type="file" multiple
                                       onChange={this.onFileChange}/>
                            </div>


                            <div className="col-2">
                                <div className="input-group">
                                    <input ref={this.inputSizeRef}
                                           type="number"
                                           step={100}
                                           min={0}
                                           className="form-control"
                                           placeholder="Size in kb"
                                    />
                                    <div className="input-group-append">
                                        <button className="btn btn-outline-primary"
                                                type="button"
                                                onClick={this.addSize}
                                        >+
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-6">
                                {
                                    this.state.sizes.map((size, idx) => {
                                        return (
                                            <button
                                                key={'size_' + idx}
                                                className="btn btn-dark mr-1"
                                                onClick={() => this.removeSize(idx)}>{size}kb</button>
                                        )
                                    })
                                }
                            </div>

                            <div className="col-2">
                                <button className="btn btn-outline-primary float-right"
                                        onClick={this.uploadAll}>Upload All
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <div id="files" className="col-12">
                    {
                        this.state.images.map((image, idx) => {
                            return (
                                <ImageRow {...image}
                                          src={image.uri}
                                          key={'image_' + idx}

                                          onRemoveClick={() => this.delete(image.id)}
                                          onUploadClick={() => this.upload(image.id)}
                                />
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}

export default Upload;
