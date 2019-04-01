import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './ImageRow.css'

class ImageRow extends Component {


    constructor(props) {
        super(props);
        this.state = {fileIdx: 0}
    }

    copyToClipboard(text) {
        const textField = document.createElement('textarea');
        textField.innerText = text;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove()
    }

    render() {

        const hasFiles = this.props.files.length > 0;
        let download, currentFile;

        if (hasFiles) {
            currentFile = this.props.files[this.state.fileIdx];

            if (currentFile) {
                const currentUrl = currentFile.url;
                download = (

                    <div className="">
                        files:
                        <ul className="nav nav-tabs">
                            {
                                this.props.files.map((file, fileIdx) => {
                                    return (
                                        <li className="nav-item " key={[this.props.name, 'file', fileIdx].join('_')}>
                                            <a onClick={() => this.setState({fileIdx})}
                                               className={[
                                                   "nav-link",
                                                   fileIdx === this.state.fileIdx ? "active" : ""
                                               ].join(" ")}
                                               href="#!">{file.id}</a>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <div className="card border-top-0 radius-0">
                            <div className="card-body">
                                <p>
                                    filename: <strong>{currentFile.name}</strong>
                                </p>
                                <p>
                                    size: <strong>{ImageRow.formatSize(currentFile.size)}</strong>
                                </p>
                                <p>
                                    url: <a href={currentFile.url} download={currentFile.name}>{currentUrl}</a>
                                </p>
                                <p>
                                    <button className="btn btn-sm btn-primary mr-1"
                                            onClick={() => this.copyToClipboard(currentUrl)}>copy url
                                    </button>
                                    <a className="btn btn-sm btn-primary mr-1"
                                       href={currentFile.url}
                                       download={currentFile.name}>download</a>

                                    <button className="btn btn-sm btn-danger"
                                            hidden={!this.props.onDeleteClick}
                                            onClick={() => this.props.onDeleteClick(currentFile.id)}>delete
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        }


        return (
            <div className="row image-row">
                <div className="media">

                    <img className="align-self-center mr-3"
                         src={currentFile ? currentFile.url : this.props.src}
                         alt={currentFile ? currentFile.name : this.props.name}/>

                    <div className="media-body ">
                        <div className="image-info">
                            <p>name: <strong>{this.props.name}</strong></p>
                            <p hidden={!this.props.status || !this.props.status.length}>
                                status: <strong>{ImageRow.formatStatus(this.props.status)}</strong>
                            </p>
                        </div>
                        <div className="image-download" hidden={this.props.hideDownloadDiv}>
                            {download}
                        </div>

                        <div className="image-action">
                            <button hidden={this.props.hideUploadBtn || !this.props.onUploadClick}
                                    className="btn btn-outline-primary mr-1"
                                    onClick={this.props.onUploadClick}>Upload
                            </button>
                            <button hidden={this.props.hideRemoveBtn || !this.props.onRemoveClick}
                                    className="btn btn-outline-dark mr-1"
                                    onClick={this.props.onRemoveClick}>Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    static formatStatus(status) {
        return [status].join(' ')
    }

    static formatDate(date) {
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
    src: PropTypes.string,
    name: PropTypes.string,
    onDeleteClick: PropTypes.func,
    onUploadClick: PropTypes.func,
    files: PropTypes.array,
    status: PropTypes.string
};

ImageRow.defaultProps = {
    src: '',
    name: '',
    status: '',

    hideUploadBtn: false,
    hideRemoveBtn: false,
    hideDownloadDiv: false,

    files: [],
    onRemoveClick: null,
    onUploadClick: null,
    onDeleteFileClick: null
};

export default ImageRow;
