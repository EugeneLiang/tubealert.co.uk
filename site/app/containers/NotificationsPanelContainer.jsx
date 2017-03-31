'use strict';

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {base64UrlToUint8Array} from '../helpers/Encoding';
import {saveSubscription, readSubscriptions} from '../redux/actions/subscription-actions';

class NotificationsPanelContainer extends Component {
    static propTypes() {
        return {
            line: PropTypes.array.isRequired,
            subscription: PropTypes.array.isRequired,
            dispatch: PropTypes.object.isRequired
        }
    }

    constructor() {
        super();
        this.state = {
            timeSlots : [],
            isLoading: false,
            statusText : null
        }
    }

    componentDidMount() {
        this.props.dispatch(readSubscriptions(this.props.line.urlKey));
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.line.urlKey !== nextProps.line.urlKey ) {
            this.props.dispatch(readSubscriptions(nextProps.line.urlKey));
        }
        this.setState({
            timeSlots: nextProps.subscription
        });
    }

    onSave() {
        this.setState({
            isLoading: true,
            statusText: 'Saving... '
        });
        const swOptions = {
            userVisibleOnly: true,
            applicationServerKey: base64UrlToUint8Array(
                'BKSO9McPgFJ6DcngM1wB2hxI_rnLoPs_JhyRh8bFJw6BBX-QFxGKYnTSVtyLu4G3Vc3jihaDUIZWiaYqEtvs_dg'
            )
        };

        window.navigator.serviceWorker.ready
            .then(
                serviceWorkerRegistration => serviceWorkerRegistration.pushManager.subscribe(swOptions)
            )
            .then(subscription => {
                const postData = {
                    userID : subscription.endpoint,
                    lineID : this.props.line.urlKey,
                    timeSlots : this.state.timeSlots,
                    subscription: subscription
                };
                return fetch('https://mdw7494b70.execute-api.eu-west-2.amazonaws.com/prod/subscribe', {
                    method: 'post',
                    body: JSON.stringify(postData)
                });
            })
            .then(response => response.json())
            .then(() => {
                // todo - update the status (save in redux)
                this.props.dispatch(saveSubscription(this.props.line.urlKey, this.state.timeSlots));
                this.setState({
                    isLoading: false,
                    statusText: 'Saved '
                });
            })
            .catch(err => {
                console.log(err);
                this.setState({
                    isLoading: false,
                    statusText: 'An error occurred '
                });
            });
    }

    isSelected(day, hour) {
        return !!(
            this.state.timeSlots[day] &&
            this.state.timeSlots[day][hour]
        );
    }

    onSelect(day, hour) {
        const slots = this.state.timeSlots;
        if (!slots[day]) {
            slots[day] = [];
        }
        slots[day][hour] = !slots[day][hour]; // toggle the state
        this.setState({
            timeSlots: slots,
            statusText: null
        });
    }

    getRow(hour) {
        const cols = [];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        for (let i=1;i<=7;i++) {
            const day = (i === 7) ? 0 : i; // sunday is zero
            const inputID = 'time-' + day + '-' + hour;
            cols.push(
                <td key={i}>
                    <input type="checkbox"
                           id={inputID}
                           checked={this.isSelected(day, hour)}
                           onChange={() => {this.onSelect(day, hour)}}
                           className="times__box" />
                    <label className="times__label"
                           htmlFor={inputID}
                    ><span className="invisible">{days[day]} {hour}:00</span></label>
                </td>
            );
        }
        return (
            <tr key={hour}>
                <th>{hour}</th>
                {cols}
            </tr>
        );
    }

    getTable() {
        if (this.state.timeSlots === null) {
            return null;
        }

        const rows = [];
        for (let i=5;i<=23;i++) {
            rows.push(this.getRow(i));
        }

        return (
            <table className="times">
                <thead>
                <tr>
                    <th>&nbsp;</th>
                    <th>M<span className="invisible">onday</span></th>
                    <th>T<span className="invisible">uesday</span></th>
                    <th>W<span className="invisible">ednesday</span></th>
                    <th>T<span className="invisible">hursday</span></th>
                    <th>F<span className="invisible">riday</span></th>
                    <th>S<span className="invisible">aturday</span></th>
                    <th>S<span className="invisible">unday</span></th>
                </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        )
    }

    render() {
        const loading = (this.state.isLoading) ? (<span className="loading loading--leading"></span>) : null;

        return (
            <div>
                <p className="card--padded">
                    Choose the times you wish to be notified for this line and hit save
                </p>
                {this.getTable()}
                <div className="card__foot text--right">
                    {loading}
                    {this.state.statusText}
                    <button className="btn" onClick={this.onSave.bind(this)}>Save</button>
                </div>
            </div>
        );
    }
}

export default connect(
    (state, props) =>  ({
        line: props.line,
        subscription: state.subscriptionsState['SUBSCRIPTION-' + props.line.urlKey] || []
    })
)(NotificationsPanelContainer);
