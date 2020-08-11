import React from 'react';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import propTypes from 'prop-types';
import {
    CachedForm, FieldSelect,
    FieldText
} from 'matsumoto/src/components/form';
import FieldDatepicker from 'matsumoto/src/components/complex/field-datepicker';
import { API } from 'matsumoto/src/core';
import apiMethods from 'core/methods';
import UI from 'stores/shuri-ui-store';
import Modal from 'parts/modal';

class ContractPage extends React.Component {
    state = {
        contract: {},
        accommodationsList: null,
        id: this.props.match.params.id,
        redirectUrl: undefined,
        isLoading: false,
        isRemoveModalShown: false
    };

    componentDidMount() {
        const { id } = this.state;
        API.get({
            url: apiMethods.accommodationsList(),
            success: (accommodationsList) => this.setState({ accommodationsList })
        })

        if (!id) {
            return;
        }

        API.get({
            url: apiMethods.contractById(id),
            success: (contract) => {
                this.setState({ contract });
            }
        })
    }

    openRemoveModal = () => {
        this.setState({
            isRemoveModalShown: true
        });
    }

    closeRemoveModal = () => {
        this.setState({
            isRemoveModalShown: false
        });
    }

    submit = (values) => {
        const { id } = this.state;
        const method = id ? 'put' : 'post';
        const url = id ? apiMethods.contractById(this.state.id) : apiMethods.contractsList();

        this.setState({ isLoading: true });
        API[method]({
            url: url,
            body: values,
            success: () => {
                this.setState({ redirectUrl: '/contracts' });
            },
            after: () => {
                this.setState({ isLoading: false })
            }
        })
    }

    removeContract = () => {
        this.setState({ isLoading: true });
        API.delete({
            url: apiMethods.contractById(this.state.id),
            success: () => {
                this.setState({ redirectUrl: '/contracts' });
            },
            after: () => {
                this.setState({ isLoading: false })
            }
        })
    }

    renderForm = (formik) => {
        const { t } = this.props;
        const { id } = this.state;
        return (
            <div className="form app-settings">
                <div className="row">
                    <FieldText formik={formik} clearable
                        id="name"
                        label="Name"
                        placeholder={t('enter-contract-name')}
                    />
                    <FieldDatepicker
                        formik={formik}
                        label="Validity Dates"
                        id="validityDates"
                        first="validFrom"
                        second="validTo"
                        placeholder={t('Choose date')}
                    />
                </div>
                <div className="row">
                    <FieldSelect
                        formik={formik}
                        id="accommodationId"
                        label={t('Accommodation')}
                        options={
                            this.state.accommodationsList?.map((item) => ({
                                value: item.id,
                                text: item.name[UI.editorLanguage]
                            }))
                        }
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="description"
                        label="Description"
                        placeholder="Enter contract description"
                    />
                </div>
                <div className="row controls">
                    <div className="field">
                        <div className="row">
                            <button
                                type="submit"
                                className="button"
                            >
                                {id ? t('Save changes') : t('create-contract-button')}
                            </button>
                            {id ?
                                <button
                                    type="button"
                                    onClick={this.openRemoveModal}
                                    className="button gray remove-contract-button"
                                >
                                    {t('Remove contract')}
                                </button> :
                                null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderRemoveModal = () => {
        const { t } = this.props;
        if (!this.state.isRemoveModalShown) {
            return null;
        }

        return (
            <Modal
                onCloseClick={this.closeRemoveModal}
                title={t('Removing contract')}
            >
                <div className="modal-content">
                    <span>{t('Are you sure you want to proceed?')}</span>
                    <div className="modal-actions">
                        <button
                            onClick={!this.state.isLoading ? this.removeContract : undefined}
                            className="button small"
                        >
                            {t('Yes')}
                        </button>
                        <button
                            onClick={this.closeRemoveModal}
                            className="button small gray"
                        >
                            {t('No')}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

    render() {
        const { t } = this.props;
        const { redirectUrl, id } = this.state;

        if (redirectUrl) {
            return <Redirect push to={redirectUrl} />;
        }

        return (
            <>
                <div className="settings block">
                    <section>
                        <h2>
                            <span className="brand">
                                {id ? `Edit contract #${id}` : t('create-contract-title')}
                            </span>
                        </h2>
                        {!this.state.accommodationsList?.length ?
                            t('No contracts found') :
                            <CachedForm
                                initialValues={this.state.contract}
                                onSubmit={!this.state.isLoading ? this.submit : undefined}
                                render={this.renderForm}
                                enableReinitialize
                            />
                        }
                    </section>
                </div>
                {this.renderRemoveModal()}
            </>
        );
    }
}

ContractPage.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(ContractPage);
