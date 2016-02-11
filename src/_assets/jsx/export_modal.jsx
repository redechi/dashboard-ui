import React from 'react';
import { Modal } from 'react-bootstrap';

class ExportModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      downloadDisabled: true
    };

    this.toggleDownloadButton = () => {
      this.setState({
        downloadDisabled: !this.refs.safariDownloadAcknowledge.checked
      });
    };

    this.downloadExport = () => {
      window.location = this.props.blobUrl;
      this.props.hideExportModal();
      this.setState({
        downloadDisabled: true
      });
    };
  }

  render() {
    return (
      <Modal show={this.props.showExportModal} onHide={this.props.hideExportModal} className="export-modal">
        <Modal.Body>
          <div className="close" onClick={this.props.hideExportModal}>x</div>
          <div>
            <h2>Export trips to .CSV</h2>
            <div className="csv-icon"></div>
            <strong>Attention</strong>
            <p>
              Your trips will be downloaded as a file called "Unknown".
              To open it, you will need to rename it and add the ".csv" extension.
            </p>
            <label className="download-acknowledge">
              <input type="checkbox" ref="safariDownloadAcknowledge" onChange={this.toggleDownloadButton} />
              Got it
            </label>
            <button
              disabled={this.state.downloadDisabled}
              className="btn btn-blue btn-close"
              onClick={this.downloadExport}
            >Download now</button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
ExportModal.propTypes = {
  hideExportModal: React.PropTypes.func.isRequired,
  showExportModal: React.PropTypes.bool.isRequired,
  blobUrl: React.PropTypes.string.isRequired
};

module.exports = ExportModal;
