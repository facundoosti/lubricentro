FactoryBot.define do
  factory :oauth_application, class: 'Doorkeeper::Application' do
    sequence(:name) { |n| "Test App #{n}" }
    redirect_uri { "urn:ietf:wg:oauth:2.0:oob" }
    scopes { "read write" }
  end
end
