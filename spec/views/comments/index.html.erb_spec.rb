require 'spec_helper'

describe "comments/index" do
  before(:each) do
    assign(:comments, [
      stub_model(Comment,
        :content => "Content",
        :author_id => 1,
        :recipient_ids => "Recipient Ids",
        :group => "Group",
        :tofu_id => 2,
        :updated_at => "Updated At",
        :created_at => "Created At"
      ),
      stub_model(Comment,
        :content => "Content",
        :author_id => 1,
        :recipient_ids => "Recipient Ids",
        :group => "Group",
        :tofu_id => 2,
        :updated_at => "Updated At",
        :created_at => "Created At"
      )
    ])
  end

  it "renders a list of comments" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Content".to_s, :count => 2
    assert_select "tr>td", :text => 1.to_s, :count => 2
    assert_select "tr>td", :text => "Recipient Ids".to_s, :count => 2
    assert_select "tr>td", :text => "Group".to_s, :count => 2
    assert_select "tr>td", :text => 2.to_s, :count => 2
    assert_select "tr>td", :text => "Updated At".to_s, :count => 2
    assert_select "tr>td", :text => "Created At".to_s, :count => 2
  end
end
