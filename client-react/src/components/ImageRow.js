import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './ImageRow.css'

class ImageRow extends Component {

    // render() {
    //     if (this.props.isUploaded)
    //         return this.renderUploaded();
    //     return (
    //         <div className="row image-row">
    //             <div className="media">
    //                 <img className="align-self-center mr-3" src={this.props.src} alt={this.props.alt}/>
    //                 <div className="media-body ">
    //
    //                     <div className="image-info">
    //                         <p>filename: <strong>{this.props.name}</strong></p>
    //                         <p className="mt-1">status: <strong>{ImageRow.formatStatus(this.props.status)}</strong></p>
    //                     </div>
    //
    //                     <div className="image-action">
    //                         <button className="btn btn-outline-primary mr-1"
    //                                 onClick={this.props.onUploadClick}>Upload
    //                         </button>
    //                         <button className="btn btn-outline-dark" onClick={this.props.onRemoveClick}>Remove
    //                         </button>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    render() {

        const hasFiles = this.props.files.length > 0;
        const small = this.props.files[0];

        return (
            <div className="row image-row">
                <div className="media">

                    <img className="align-self-center mr-3" src={hasFiles ? small.url : this.props.src}
                         alt={hasFiles ? small.name : this.props.name}/>

                    <div className="media-body ">
                        <div className="image-info">
                            <p>filename: <strong>{this.props.name}</strong></p>
                            <p>status: <strong>{ImageRow.formatStatus(this.props.status)}</strong></p>
                        </div>

                        <div className="image-download" hidden={this.props.hideDownloadDiv}>
                            <p>download:</p>
                            <div>
                                {
                                    this.props.files.map((file, idx) => {
                                        const isOriginal = (idx === this.props.files.length - 1);
                                        return <a href={file.url}
                                                  download={this.props.name}
                                                  className={["btn", "mr-1", isOriginal ? "btn-outline-dark" : "btn-outline-primary"].join(" ")}
                                                  key={[this.props.name, idx].join('_')}>{file.id}</a>
                                    })
                                }
                            </div>
                        </div>

                        <div className="image-action">
                            <button hidden={this.props.hideUploadBtn} className="btn btn-outline-primary mr-1"
                                    onClick={this.props.onUploadClick}>Upload
                            </button>
                            <button hidden={this.props.hideRemoveBtn} className="btn btn-outline-dark"
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
    // size: PropTypes.number,
    // type: PropTypes.string,
    // lastModifiedDate: PropTypes.instanceOf(Date),
    // lastModified: PropTypes.number,
    // isUploaded: PropTypes.bool,

    src: PropTypes.string,
    name: PropTypes.string,
    onDeleteClick: PropTypes.func,
    onUploadClick: PropTypes.func,
    files: PropTypes.array,
    status: PropTypes.string
};

ImageRow.defaultProps = {
    // lastModifiedDate: new Date(),
    // isUploaded: false,

    src: '',
    name: 'NO NAME',
    status: '',
    hideUploadBtn: false,
    hideRemoveBtn: false,
    hideDownloadDiv: false,
    files: [],
    onRemoveClick: () => console.log('onDeleteClick'),
    onUploadClick: () => console.log('onUploadClick')
};

export default ImageRow;
