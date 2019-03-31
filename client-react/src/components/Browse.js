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
        const query = {
            sortBy: 'timestamp',
            sort: 'desc',
            limit: 100,
            from: 0
        };

        fetch('/images?' + Object.keys(query).map((key) => [key, encodeURIComponent(query[key])].join('=')).join('&'))
            .then((response) => response.json())
            .then((images) => this.setState({images}))
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
                            if (image.hash === hash)
                                image.files = image.files.filter((file) => file.id !== size)
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
