'use strict';

import React from 'react';

import 'scss/molecules/_card.scss';

const NotificationsUnsupported = () => {
    return (
        <div className="card--padded" >
            <p className="g-unit">
                <strong>Your browser does not support notifications.</strong>
            </p>
            <p className="g-unit">
                Push Notifications on the open web are currently only supported
                by Firefox, Chrome and Opera. They are not supported on iOS, as the
                underlying browser is Safari, which does not support notifications.
            </p>
            <p className="g-unit">
                Please contact your browser vendor to encourage them to support
                this feature.
            </p>
        </div>
    );
};

export default NotificationsUnsupported;
