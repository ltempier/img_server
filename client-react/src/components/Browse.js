import React, {Component} from 'react';

import ImageRow from './ImageRow';

class Browse extends Component {

    constructor(props) {
        super(props);
        this.state = {
            images: []
        };

        this.deleteFile = this.deleteFile.bind(this)
    }

    componentDidMount() {
        fetch('/images')
            .then((response) => {
                return response.json();
            })
            .then((images) => {
                this.setState({images})
            })
            .catch((error) => {
                console.log('error', error)
            });
    }

    deleteFile(hash, size) {
        fetch(`/images/${hash}/${size}`, {method: 'delete'})
            .then(() => {
                this.setState((state) => {
                    return {
                        ...state,
                        images: state.images.map(function (image) {
                            if (image.hash === hash) {
                                image.files = image.files.filter(function (file) {
                                    return file.id !== size
                                })
                            }
                            return image
                        })
                    }
                });
            })
            .catch((error) => {
                console.log('error', error)
            });
    }

    render() {
        return (
            <div className="container mt-5">

                {
                    this.state.images.map((image, idx) => {
                        return (
                            <ImageRow
                                key={idx}

                                {...image}
                                alt={image.originalName}
                                name={image.originalName}
                                files={image.files}

                                hideUploadBtn={true}
                                hideRemoveBtn={true}

                                onDeleteClick={(size) => this.deleteFile(image.hash, size)}
                            />
                        )
                    })
                }

            </div>
        );
    }
}

export default Browse;
