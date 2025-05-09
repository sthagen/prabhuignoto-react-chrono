import {
  FunctionComponent,
  PointerEvent,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { GlobalContext } from '../../GlobalContext';
import ChevronIcon from '../../icons/chev-right';
import { ContentFooterProps } from './header-footer.model';
import {
  ChevronIconWrapper,
  ShowMore,
  SlideShowProgressBar,
} from './timeline-card-content.styles';

/**
 * ContentFooter
 *
 * A functional component that renders the footer of the timeline card.
 * It displays the read more/less button, progress bar, and triangle icon.
 * The read more/less button appears only if the content is large.
 * The progress bar and triangle icon are displayed only if the card is in slideshow mode.
 *
 * @property {boolean} showProgressBar - Determines if progress bar should be displayed.
 * @property {Function} onExpand - Function called when expanding content.
 * @property {string} triangleDir - Direction of the triangle icon.
 * @property {boolean} showMore - Determines if 'read more' should be displayed.
 * @property {boolean} textContentIsLarge - Determines if text content is large.
 * @property {boolean} showReadMore - Determines if 'read more' button should be displayed.
 * @property {number} remainInterval - Remaining interval for progress bar.
 * @property {boolean} paused - Determines if progress is paused.
 * @property {number} startWidth - Starting width of progress bar.
 * @property {boolean} canShow - Determines if the element can be shown.
 * @property {React.RefObject} progressRef - Ref to the progress bar.
 * @property {boolean} isNested - Determines if component is nested.
 * @property {boolean} isResuming - Determines if slideshow is resuming.
 *
 * @returns {JSX.Element} ContentFooter component.
 */
const ContentFooter: FunctionComponent<ContentFooterProps> = ({
  showProgressBar,
  onExpand,
  showMore,
  textContentIsLarge,
  showReadMore,
  remainInterval,
  paused,
  startWidth,
  canShow,
  progressRef,
  isResuming,
}: ContentFooterProps) => {
  const { theme } = useContext(GlobalContext);

  const handleClick = useCallback(
    (ev: PointerEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      onExpand();
    },
    [onExpand],
  );

  const canShowMore = useMemo(() => {
    // Only show read more when:
    // 1. The feature is enabled (showReadMore)
    // 2. The text is actually large enough to need expansion (textContentIsLarge)
    // 3. The parent says it's valid to show (canShow) - this might indicate we have detailedText
    return showReadMore && textContentIsLarge && canShow;
  }, [showReadMore, textContentIsLarge, canShow]);

  return (
    <>
      {canShowMore ? (
        <ShowMore
          className="show-more"
          onPointerDown={handleClick}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onExpand();
            }
          }}
          show={canShow ? 'true' : 'false'}
          theme={theme}
          tabIndex={0}
        >
          {<span>{showMore ? 'read less' : 'read more'}</span>}
          <ChevronIconWrapper collapsed={showMore ? 'true' : 'false'}>
            <ChevronIcon />
          </ChevronIconWrapper>
        </ShowMore>
      ) : null}

      {showProgressBar && (
        <SlideShowProgressBar
          color={theme?.primary}
          $duration={remainInterval}
          $paused={paused}
          ref={progressRef}
          $startWidth={startWidth}
          $resuming={isResuming}
        ></SlideShowProgressBar>
      )}
    </>
  );
};

export { ContentFooter };
