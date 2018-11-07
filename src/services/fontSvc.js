/*
 * module for defining the fontawesome icons to
 * be used in this project
 */
import Vue from 'vue';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

import * as faCog from '@fortawesome/fontawesome-free-solid/faCog';
import * as faBars from '@fortawesome/fontawesome-free-solid/faBars';
import * as faArrowLeft from '@fortawesome/fontawesome-free-solid/faArrowLeft';
import * as faCaretDown from '@fortawesome/fontawesome-free-solid/faCaretDown';
import * as faAngleDown from '@fortawesome/fontawesome-free-solid/faAngleDown';
import * as faAngleRight from '@fortawesome/fontawesome-free-solid/faAngleRight';
import * as faMinusCircle from '@fortawesome/fontawesome-free-solid/faMinusCircle';
import * as faCircle from '@fortawesome/fontawesome-free-solid/faCircle';
import * as faPlusCircle from '@fortawesome/fontawesome-free-solid/faPlusCircle';
import * as faArrowCircleUp from '@fortawesome/fontawesome-free-solid/faArrowCircleUp';
import * as faExternalLinkAlt from '@fortawesome/fontawesome-free-solid/faExternalLinkAlt';

import * as faList from '@fortawesome/fontawesome-free-solid/faList';
import * as faTimes from '@fortawesome/fontawesome-free-solid/faTimes';
import * as faPlus from '@fortawesome/fontawesome-free-solid/faPlus';
import * as faMinus from '@fortawesome/fontawesome-free-solid/faMinus';
import * as faCode from '@fortawesome/fontawesome-free-solid/faCode';
import * as faQuoteRight from '@fortawesome/fontawesome-free-solid/faQuoteRight';
import * as faEdit from '@fortawesome/fontawesome-free-solid/faEdit';
import * as faTrash from '@fortawesome/fontawesome-free-solid/faTrash';
import * as faEraser from '@fortawesome/fontawesome-free-solid/faEraser';

import * as faMinusSquare from '@fortawesome/fontawesome-free-regular/faMinusSquare';
import * as faPlusSquare from '@fortawesome/fontawesome-free-regular/faPlusSquare';
import * as faOutdent from '@fortawesome/fontawesome-free-solid/faIndent';
import * as faIndent from '@fortawesome/fontawesome-free-solid/faOutdent';
import * as faListUl from '@fortawesome/fontawesome-free-solid/faListUl';
import * as faListOl from '@fortawesome/fontawesome-free-solid/faListOl';
import * as faFileCode from '@fortawesome/fontawesome-free-solid/faFileCode';
import * as faTerminal from '@fortawesome/fontawesome-free-solid/faTerminal';

// icons for default editor actions
import * as faCut from '@fortawesome/fontawesome-free-solid/faCut';
import * as faPaste from '@fortawesome/fontawesome-free-solid/faPaste';
import * as faCopy from '@fortawesome/fontawesome-free-solid/faCopy';
import * as faBold from '@fortawesome/fontawesome-free-solid/faBold';
import * as faItalic from '@fortawesome/fontawesome-free-solid/faItalic';
import * as faStrikeThrough from '@fortawesome/fontawesome-free-solid/faStrikethrough';
import * as faUnderline from '@fortawesome/fontawesome-free-solid/faUnderline';
import * as faParagraph from '@fortawesome/fontawesome-free-solid/faParagraph';
import * as faFont from '@fortawesome/fontawesome-free-solid/faFont';

// miscellaneous
import * as faBug from '@fortawesome/fontawesome-free-solid/faBug';
import * as faQuestionCircle from '@fortawesome/fontawesome-free-solid/faQuestionCircle';
import * as faSearchPlus from '@fortawesome/fontawesome-free-solid/faSearchPlus';
import * as faSearchMinus from '@fortawesome/fontawesome-free-solid/faSearchMinus';
import * as faSync from '@fortawesome/fontawesome-free-solid/faSync';
import * as faRedo from '@fortawesome/fontawesome-free-solid/faRedo';

import * as faExclamationTriangle from '@fortawesome/fontawesome-free-solid/faExclamationTriangle';
import * as faExclamationCircle from '@fortawesome/fontawesome-free-solid/faExclamationCircle';
import * as faInfoCircle from '@fortawesome/fontawesome-free-solid/faInfoCircle';
import * as faCheckCircle from '@fortawesome/fontawesome-free-solid/faCheckCircle';
import * as faFlask from '@fortawesome/fontawesome-free-solid/faFlask';
import * as faStickyNote from '@fortawesome/fontawesome-free-regular/faStickyNote';
import * as faComment from '@fortawesome/fontawesome-free-regular/faComment';
import * as faBook from '@fortawesome/fontawesome-free-solid/faBook';

// brand icons
import * as faCss3Alt from '@fortawesome/fontawesome-free-brands/faCss3Alt';

import fontawesome from '@fortawesome/fontawesome';

Vue.component('icon', FontAwesomeIcon);
fontawesome.library.add(
  faCog,
  faBook,
  faCircle,
  faPlus,
  faCode,
  faQuoteRight,
  faEdit,
  faTrash,
  faMinus,
  faBars,
  faArrowLeft,
  faAngleDown,
  faCaretDown,
  faAngleRight,
  faList,
  faTimes,
  faMinusCircle,
  faPlusCircle,
  faArrowCircleUp,
  faPlusSquare,
  faMinusSquare,
  faEraser,
  faCut,
  faCopy,
  faPaste,
  faBold,
  faItalic,
  faStrikeThrough,
  faUnderline,
  faIndent,
  faOutdent,
  faListUl,
  faListOl,
  faFileCode,
  faTerminal,
  faParagraph,
  faBug,
  faQuestionCircle,
  faParagraph,
  faCss3Alt,
  faFlask,
  faExclamationTriangle,
  faExclamationCircle,
  faStickyNote,
  faComment,
  faCheckCircle,
  faInfoCircle,
  faFont,
  faSearchMinus,
  faSearchPlus,
  faSync,
  faRedo,
  faExternalLinkAlt
);
