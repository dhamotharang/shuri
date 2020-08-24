import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';
import Table from 'matsumoto/src/components/external/table';
import UIStore from 'stores/shuri-ui-store';
import { Link, Redirect } from 'react-router-dom';
import { Loader } from 'matsumoto/src/simple';
import DialogModal from 'parts/dialog-modal';
import propTypes from 'prop-types';
import {
    getAccommodationRooms,
    removeAccommodationRooms
} from 'providers/api';

const PAGE_SIZE = 10;

@observer
class RoomsList extends React.Component {
    @observable roomsList = null;
    @observable tablePageIndex = 0;
    @observable tableColumns;
    @observable isRemoveModalShown = false;
    @observable redirectUrl;
    @observable isRequestingApi = false;
    @observable accommodationId = this.props.match.params.accommodationId;

    constructor(props) {
        super(props);
        const { t } = this.props;

        this.tableColumns = [
            {
                Header: 'Room Id',
                accessor: 'id'
            },
            {
                Header: t('name'),
                accessor: 'name',
                Cell: (item) => item.cell.value[UIStore.editorLanguage]
            },
            {
                Header: 'Actions',
                accessor: 'id',
                Cell: (item) => (
                    <Link to={`/accommodation/${this.accommodationId}/room/${item.cell.value}`}>
                        <span className="icon icon-action-pen-orange"/>
                    </Link>
                )
            }
        ];
    }

    componentDidMount() {
        getAccommodationRooms({
            urlParams: {
                accommodationId: this.accommodationId
            }
        }).then(this.getAccommodationRoomsSuccess);
    }

    get roomsIds() {
        return this.roomsList?.map((room) => room.id);
    }

    @action
    getAccommodationRoomsSuccess = (list) => {
        this.roomsList = list
    }

    setRedirectUrl = () => {
        this.setState({ redirectUrl: `/accommodation/${this.accommodationId}` });
    }

    @action
    setRequestingApiStatus = () => {
        this.isRequestingApi = true;
    }

    @action
    unsetRequestingApiStatus = () => {
        this.isRequestingApi = false;
    }

    onRoomsRemove = () => {
        this.setRequestingApiStatus();
        removeAccommodationRooms({
            urlParams: {
                accommodationId: this.accommodationId
            },
            body: this.roomsIds
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    @action
    onPaginationClick = ({ pageIndex }) => {
        this.tablePageIndex = pageIndex;
    }

    @action
    onOpenRemoveModal = () => {
        this.isRemoveModalShown = true;
    }

    @action
    onCloseRemoveModal = () => {
        this.isRemoveModalShown = false;
    }

    renderContent = () => {
        if (this.roomsList === null) {
            return <Loader />;
        }
        const tableData = this.roomsList.slice(
            PAGE_SIZE * this.tablePageIndex,
            PAGE_SIZE * (this.tablePageIndex + 1)
        );

        return this.roomsList.length ?
            <Table
                data={tableData}
                count={this.roomsList.length}
                fetchData={this.onPaginationClick}
                columns={this.tableColumns}
                pageIndex={this.tablePageIndex}
                pageSize={PAGE_SIZE}
                manualPagination
            /> :
            'No results';
    }

    render() {
        const { t } = this.props;

        if (this.redirectUrl) {
            return <Redirect push to={this.redirectUrl} />;
        }

        return (
            <>
                <div className="settings block">
                    <section>
                        <Breadcrumbs
                            backLink={`/accommodation/${this.accommodationId}`}
                            items={[
                                {
                                    text: 'Accommodations list',
                                    link: '/'
                                }, {
                                    text: 'Accommodation',
                                    link: `/accommodation/${this.accommodationId}`
                                }, {
                                    text: 'Rooms list'
                                }
                            ]}
                        />
                        <h2>
                            <div className="add-new-button-holder">
                                <Link to={`/accommodation/${this.accommodationId}/room`}>
                                    <button className="button small">
                                        Add new room
                                    </button>
                                </Link>
                                <button
                                    type="button"
                                    disabled={!this.roomsList?.length}
                                    onClick={this.onOpenRemoveModal}
                                    className="button small gray remove-button"
                                >
                                    {t('Remove rooms')}
                                </button>
                            </div>
                            <span className="brand">
                                {`Rooms list In Accommodation #${this.accommodationId}`}
                            </span>
                        </h2>
                        {this.renderContent()}
                    </section>
                </div>
                {this.isRemoveModalShown ?
                    <DialogModal
                        title={t('Removing rooms')}
                        text={t('Are you sure you want to proceed?')}
                        onNoClick={this.onCloseRemoveModal}
                        onYesClick={!this.isRequestingApi ? this.onRoomsRemove : undefined}
                    /> :
                    null
                }
            </>
        );
    }
}

RoomsList.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(RoomsList);