import React from 'react';
import propTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import {
    CachedForm,
    FieldText
} from 'matsumoto/src/components/form';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';
import UI from 'stores/shuri-ui-store';
import DialogModal from 'parts/dialog-modal';
import {
    createAccommodationRoom,
    getAccommodationRoom,
    removeAccommodationRoom,
    updateAccommodationRoom
} from 'providers/api';

class RoomPage extends React.Component {
    state = {
        room: {
            name: { ar: '', en: '', ru: '' },
            description: { ar: '', en: '', ru: '' },
            amenities: { ar: [], en: [], ru: [] },
            pictures: {}
        },
        id: this.props.match.params.id,
        accommodationId: this.props.match.params.accommodationId,
        redirectUrl: undefined,
        isRequestingApi: false,
        isRemoveModalShown: false
    };

    componentDidMount() {
        const { id } = this.state;
        if (!id) {
            return;
        }

        getAccommodationRoom({
            urlParams: {
                accommodationId: this.state.accommodationId,
                roomId: id
            }
        }).then(this.getAccommodationRoomSuccess);
    }

    getAccommodationRoomSuccess = (room) => {
        this.setState({ room })
    }

    setRedirectUrl = () => {
        this.setState({ redirectUrl: `/accommodation/${this.state.accommodationId}/rooms` });
    }

    setRequestingApiStatus = () => {
        this.setState({ isRequestingApi: true });
    }

    unsetRequestingApiStatus = () => {
        this.setState({ isRequestingApi: false });
    }

    reformatValues = (values) => {
        if (!values.occupancyConfigurations) {
            values.occupancyConfigurations = [
                {
                    adults: 2,
                    teenagers: 1,
                    children: 0,
                    infants: 0
                }
            ];
        }

        return values;
    }

    onOpenRemoveModal = () => {
        this.setState({
            isRemoveModalShown: true
        });
    }

    onCloseRemoveModal = () => {
        this.setState({
            isRemoveModalShown: false
        });
    }

    onRoomRemove = () => {
        this.setRequestingApiStatus();
        removeAccommodationRoom({
            urlParams: {
                accommodationId: this.state.accommodationId,
                roomId: this.state.id
            }
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    onCreateSubmit = (values) => {
        if (this.state.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus();
        createAccommodationRoom({
            urlParams: {
                accommodationId: this.state.accommodationId
            },
            body: [this.reformatValues(values)]
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    onUpdateSubmit = (values) => {
        if (this.state.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus();
        updateAccommodationRoom({
            urlParams: {
                accommodationId: this.state.accommodationId,
                roomId: this.state.id
            },
            body: this.reformatValues(values)
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    renderForm = (formik) => {
        const { t } = this.props;
        const { id } = this.state;
        return (
            <div className="form app-settings">
                <div className="row">
                    <FieldText formik={formik} clearable
                        id={`name.${UI.editorLanguage}`}
                        label="Name"
                        placeholder="Enter room name"
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                        id={`description.${UI.editorLanguage}`}
                        label="Description"
                        placeholder="Enter room description"
                    />
                </div>
                <div className="row controls">
                    <div className="field">
                        <div className="row">
                            <button
                                type="submit"
                                className="button"
                            >
                                {id ? t('Save changes') : 'Create room'}
                            </button>
                            {id ?
                                <button
                                    type="button"
                                    onClick={this.onOpenRemoveModal}
                                    className="button gray remove-button"
                                >
                                    {t('Remove room')}
                                </button> :
                                null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { t } = this.props;
        const {
            redirectUrl,
            id,
            accommodationId
        } = this.state;

        if (redirectUrl) {
            return <Redirect push to={redirectUrl} />;
        }

        return (
            <>
                <div className="settings block">
                    <section>
                        <Breadcrumbs
                            backLink={`/accommodation/${accommodationId}/rooms`}
                            items={[
                                {
                                    text: 'Accommodations list',
                                    link: '/'
                                }, {
                                    text: 'Accommodation',
                                    link: `/accommodation/${accommodationId}`
                                }, {
                                    text: 'Rooms list',
                                    link: `/accommodation/${accommodationId}/rooms`
                                }, {
                                    text: 'Room'
                                }
                            ]}
                        />
                        <h2>
                            <span className="brand">
                                {id ? `Edit room #${id}` : 'Create new room'}
                            </span>
                        </h2>
                        <CachedForm
                            initialValues={this.state.room}
                            onSubmit={id ? this.onUpdateSubmit : this.onCreateSubmit}
                            render={this.renderForm}
                            enableReinitialize
                        />
                    </section>
                </div>
                {this.state.isRemoveModalShown ?
                    <DialogModal
                        title={t('Removing room')}
                        text={t('Are you sure you want to proceed?')}
                        onNoClick={this.onCloseRemoveModal}
                        onYesClick={!this.state.isRequestingApi ? this.onRoomRemove : undefined}
                    /> :
                    null
                }
            </>
        );
    }
}

RoomPage.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(RoomPage);