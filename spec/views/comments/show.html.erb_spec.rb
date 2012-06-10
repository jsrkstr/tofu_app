require 'spec_helper'

describe "comments/show" do
  before(:each) do
    @comment = assign(:comment, stub_model(Comment,
      :content => "Content",
      :author_id => 1,
      :recipient_ids => "Recipient Ids",
      :group => "Group",
      :tofu_id => 2,
      :updated_at => "Updated At",
      :created_at => "Created At"
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Content/)
    rendered.should match(/1/)
    rendered.should match(/Recipient Ids/)
    rendered.should match(/Group/)
    rendered.should match(/2/)
    rendered.should match(/Updated At/)
    rendered.should match(/Created At/)
  end
end
