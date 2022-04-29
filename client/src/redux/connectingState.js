import { connect } from 'react-redux';
import { messageAction } from './Actions/messageAction';

const mapStateToProps = (state) => ({ state });
const mapDispatchToProps = (dispatch) => {
	return {
		addMessages: (id, message, time, room) => {
			dispatch(messageAction(id, message, time, room));
		},
	};
};

const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected;
