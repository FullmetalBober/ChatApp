import Lottie from 'react-lottie-player';
import animationData from '../../animations/typing.json';

const Typing = () => {
  return (
    <Lottie loop play animationData={animationData} style={{ height: 45 }} />
  );
};

export default Typing;
