import React, {Component} from 'react';

import ImageRow from './ImageRow';

class Browse extends Component {

    constructor(props) {
        super(props);
        this.state = {
            images: []
        }
    }

    componentDidMount() {
        fetch('/api/images')
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

    render() {
        return (
            <div className="container mt-5">


                {
                    this.state.images.map((image, idx) => {

                        // const files = image.files;
                        // const keys = Object.keys(files);
                        // const url = [image.url, keys[0]].join('/');

                        return (
                            <ImageRow
                                {...image}
                                alt={image.originalName}
                                name={image.originalName}
                                files={image.files}
                                key={idx}
                                isUploaded={true}
                            />
                        )

                    })
                }

            </div>
        );
    }
}

export default Browse;
