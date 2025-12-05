interface ProgressBarProps {
    current: number;
    total: number;
    timeLeft: number;
}

const ProgressBar = ({ current, total, timeLeft }: ProgressBarProps) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div className="progress-bar">
                문제 {current} / {total}
            </div>
            <div style={{
                color: timeLeft <= 5 ? 'red' : 'black',
                fontWeight: 'bold',
                fontSize: '1.2rem'
            }}>
                ⏰ 남은 시간: {timeLeft}초
            </div>
        </div>
    );
};

export default ProgressBar;