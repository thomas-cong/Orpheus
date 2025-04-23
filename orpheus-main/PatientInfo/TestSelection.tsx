const TestSelection = (props: { setTest: (test: string) => void }) => {
    return (
        <div>
            <select onChange={(e) => props.setTest(e.target.value)}>
                <option value="">Select Test</option>
                <option value="RAVLT">RAVLT</option>
            </select>
        </div>
    );
};

export default TestSelection;
