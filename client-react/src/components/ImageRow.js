import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './ImageRow.css'

class ImageRow extends Component {


    render() {
        if (this.props.isUploaded)
            return this.renderUploaded();


        return (
            <div className="row image-row">
                <div className="media">
                    <img className="align-self-center mr-3" src={this.props.src} alt={this.props.alt}/>
                    <div className="media-body ">
                        <div className="image-info">
                            <p>name: <strong>{this.props.name}</strong></p>
                            <p className="mt-1">status: <strong>{ImageRow.formatSatus(this.props.status)}</strong></p>
                        </div>

                        <div className="image-action">
                            <button className="btn btn-outline-primary mr-1 action-upload"
                                    onClick={this.props.onUploadClick}>Upload
                            </button>
                            <button className="btn btn-danger action-delete" onClick={this.props.onDeleteClick}>Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderUploaded() {

        let src = this.props.src;
        let alt = this.props.alt;

        const files = Object.keys(this.props.files).map((key, index) => {
            return {
                ...this.props.files[key],
                key: key,
                url: [this.props.url, key].join('/')
            }
        }).sort(function (a, b) {
            return a.size - b.size;
        });

        src = files[0].url;
        alt = files[0].name;


        return (
            <div className="row image-row">
                <div className="media">
                    <img className="align-self-center mr-3" src={src} alt={alt}/>
                    <div className="media-body ">

                        <div className="image-info">
                            <p>name: <strong>{this.props.name}</strong></p>

                            {
                                files.map((file, key) => {
                                    return (
                                        <div key={key}>
                                            {file.key}: <a href={file.url}>{file.name}</a>
                                        </div>
                                    )
                                })
                            }
                        </div>

                        <div className="image-action">


                        </div>
                    </div>
                </div>
            </div>
        )
    }


    static formatSatus(status) {
        return [status].join(' ')
    }

    static formatDate(date) {
        if (!typeof date === Date)
            date = Date(date);
        return [date.toLocaleDateString(), date.toLocaleTimeString()].join(' ')
    }

    static formatSize(sizeBites) {
        const units = [
            {val: 1000, text: 'Kb'},
            {val: 1000000, text: 'Mb'},
            {val: 1000000000, text: 'Gb'}
        ];
        let param = units[0];
        units.some(function (unit) {
            if ((sizeBites / unit.val) < 1)
                return true;
            param = unit;
            return false;
        });
        return [Math.round(sizeBites / (param.val / 10)) / 10, param.text].join(' ')
    }
}

ImageRow.propTypes = {
    // size: PropTypes.number,
    // type: PropTypes.string,
    // lastModifiedDate: PropTypes.instanceOf(Date),
    // lastModified: PropTypes.number,

    src: PropTypes.string,
    alt: PropTypes.string,
    name: PropTypes.string,
    isUploaded: PropTypes.bool,
    onDeleteClick: PropTypes.func,
    onUploadClick: PropTypes.func,
    files: PropTypes.object,
    status: PropTypes.string
};

ImageRow.defaultProps = {
    // lastModifiedDate: new Date(),

    src: '',
    alt: '',
    name: 'NO NAME',
    isUploaded: false,
    onDeleteClick: () => console.log('onDeleteClick'),
    onUploadClick: () => console.log('onUploadClick')
};

export default ImageRow;
