import React, {Component} from 'react';
import {NavLink} from "react-router-dom";

import './Nav.css';

class Nav extends Component {

    constructor(props) {
        super(props);
        this.state = {
            collapse: true
        };

        this.collapse = this.collapse.bind(this)
    }

    collapse(collapse) {
        this.setState({
            collapse: isBoolean(collapse) ? collapse : !this.state.collapse
        });

        function isBoolean(val) {
            return val === false || val === true;
        }
    }

    render() {

        return (
            <nav className="navbar navbar-expand-sm navbar-dark bg-dark" onMouseLeave={() => this.collapse(true)}>

                <div className="container">
                    <button type="button"
                            className={[this.state.collapse ? 'collapsed' : '', "navbar-toggler"].join(' ')}
                            onClick={this.collapse}>
                        <span className="icon-bar"/>
                        <span className="icon-bar"/>
                        <span className="icon-bar"/>
                    </button>

                    {/*<a className="navbar-brand" href="#">img_server</a>*/}

                    <div className={[this.state.collapse ? 'collapse' : '', "navbar-collapse "].join(' ')}>
                        <ul className="navbar-nav mr-auto mt-2 mt-md-0">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/upload">Upload</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/browse">Browse</NavLink>
                            </li>
                        </ul>
                    </div>
                </div>


            </nav>
        );
    }
}

export default Nav;
