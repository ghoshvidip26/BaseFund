// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

contract CrowdFund {
    struct Projects {
        address projectCreator;
        string imageURI;
        string title;
        string description;
        string[] contributor;
        uint256 fundingGoal;
        uint256 amountRaised;
        uint deadline;
        string ghLink;
        string category;
        mapping(address => uint256) contributions;
    }

    address private immutable owner;
    Projects[] public projects;
    bool private locked;

    event ProjectCreated(
        address projectCreator,
        string imageURI,
        string title,
        string description,
        string[] contributor,
        uint256 fundingGoal,
        uint deadline,
        string ghLink,
        string category
    );

    event ContributionMade(string contributor, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    function createProject(
        string memory imageURI,
        string memory title,
        string memory description,
        uint256 fundingGoal,
        uint deadline,
        string memory ghLink,
        string memory category
    ) public onlyOwner {
        require(bytes(title).length > 0, "Title must not be empty");
        require(bytes(description).length > 0, "Description must not be empty");
        require(bytes(imageURI).length > 0, "Image URI must not be empty");
        require(fundingGoal > 0, "Funding goal must be greater than zero");
        require(deadline > block.timestamp, "Deadline must be in the future");

        projects.push(); // create empty slot
        Projects storage p = projects[projects.length - 1];

        p.projectCreator = msg.sender;
        p.imageURI = imageURI;
        p.title = title;
        p.description = description;
        p.fundingGoal = fundingGoal;
        p.amountRaised = 0;
        p.deadline = deadline;
        p.ghLink = ghLink;
        p.category = category;

        emit ProjectCreated(
            msg.sender,
            imageURI,
            title,
            description,
            new string[](0),
            fundingGoal,
            deadline,
            ghLink,
            category
        );
    }

    function contribute(string memory title) public payable {
        require(msg.value > 0, "Contribution must be greater than 0");

        bool found = false;
        for (uint256 i = 0; i < projects.length; i++) {
            if (
                keccak256(bytes(projects[i].title)) == keccak256(bytes(title))
            ) {
                require(
                    block.timestamp < projects[i].deadline,
                    "Deadline has passed"
                );
                require(
                    projects[i].amountRaised < projects[i].fundingGoal,
                    "Funding goal reached"
                );
                projects[i].contributor.push(
                    string(abi.encodePacked(msg.sender))
                );
                projects[i].amountRaised += msg.value;
                payable(projects[i].projectCreator).transfer(msg.value);
                emit ContributionMade(
                    string(abi.encodePacked(msg.sender)),
                    msg.value
                );
                found = true;
                break;
            }
        }
        require(found, "Project not found");
    }

    function refund(string memory title) public {
        for (uint256 i = 0; i < projects.length; i++) {
            if (
                keccak256(bytes(projects[i].title)) == keccak256(bytes(title))
            ) {
                require(
                    block.timestamp > projects[i].deadline,
                    "Deadline has not passed yet"
                );
                require(
                    projects[i].amountRaised < projects[i].fundingGoal,
                    "Funding goal reached"
                );
                require(
                    projects[i].contributions[msg.sender] > 0,
                    "No contribution found"
                );
                payable(msg.sender).transfer(
                    projects[i].contributions[msg.sender]
                );
                projects[i].contributions[msg.sender] = 0;
            }
        }
    }
}
