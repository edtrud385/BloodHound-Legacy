import React, {useContext, useState} from 'react';
import {AppContext} from '../../AppContext';
import {motion} from 'framer-motion';

const MenuButton = ({ glyphicon, click, rightClick, hoverVal }) => {
    const [hovered, setHovered] = useState(false);
    const context = useContext(AppContext);

    const enterButton = () => {
        setHovered(true);
    };

    const exitButton = () => {
        setHovered(false);
    };

    const variants = {
        open: { width: 'auto' },
        closed: { width: '41px' },
    };

    const clickHandler = (e) => {
        click(e);
        e.target.blur();
    };

    return (
        <motion.button
            className={
                context.darkMode
                    ? 'btn menu-button-dark'
                    : 'btn menu-button-light'
            }
            variants={variants}
            initial={'closed'}
            animate={hovered ? 'open' : 'closed'}
            transition={{ duration: 0.1 }}
            onMouseEnter={enterButton}
            onMouseLeave={exitButton}
            onClick={clickHandler}
            onContextMenu={
                rightClick
                    ? (e) => {
                          e.preventDefault();
                          rightClick(e);
                      }
                    : undefined
            }
        >
            {hovered ? hoverVal : ''} <span className={glyphicon} />
        </motion.button>
    );
};

MenuButton.propTypes = {};
export default MenuButton;
